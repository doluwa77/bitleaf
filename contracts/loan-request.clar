;; Bitleaf Loan Request Contract
;; Clarity v2
;; Allows verified borrowers to post and manage loan requests

(define-constant ERR-NOT-AUTHORIZED u100)
(define-constant ERR-INVALID-AMOUNT u101)
(define-constant ERR-INVALID-DURATION u102)
(define-constant ERR-NO-REQUEST u103)
(define-constant ERR-REQUEST-ALREADY-FULFILLED u104)
(define-constant ERR-REQUEST-NOT-PENDING u105)

;; Configuration
(define-constant MIN-LOAN-AMOUNT u1000)          ;; 1,000 microtokens (e.g., 0.001 USDC)
(define-constant MAX-LOAN-AMOUNT u100000000)     ;; 100M microtokens (100 USDC)
(define-constant MIN-DURATION u1)                ;; 1 block (~10 min)
(define-constant MAX-DURATION u52560)            ;; ~1 year in blocks

(define-data-var admin principal tx-sender)

;; Loan status options
(define-constant STATUS-PENDING u0)
(define-constant STATUS-FULFILLED u1)
(define-constant STATUS-CANCELLED u2)

(define-trait trait-loan-verifier
  (
    (is-verified (user principal) (response bool uint))
  )
)

(define-constant loan-verifier-contract 'SP000000000000000000002Q6VF78.loan-verifier)

;; Loan request data structure
(define-map loan-requests
  uint
  {
    borrower: principal,
    amount: uint,
    interest-rate: uint,
    duration: uint,
    created-at: uint,
    status: uint
  }
)

(define-data-var next-loan-id uint u1)

;; Private helper: only admin
(define-private (is-admin)
  (is-eq tx-sender (var-get admin))
)

;; Public: transfer admin
(define-public (transfer-admin (new-admin principal))
  (begin
    (asserts! (is-admin) (err ERR-NOT-AUTHORIZED))
    (var-set admin new-admin)
    (ok true)
  )
)

;; Public: create loan request
(define-public (create-loan-request (amount uint) (interest-rate uint) (duration uint))
  (begin
    (asserts! (>= amount MIN-LOAN-AMOUNT) (err ERR-INVALID-AMOUNT))
    (asserts! (<= amount MAX-LOAN-AMOUNT) (err ERR-INVALID-AMOUNT))
    (asserts! (>= duration MIN-DURATION) (err ERR-INVALID-DURATION))
    (asserts! (<= duration MAX-DURATION) (err ERR-INVALID-DURATION))

    (let ((verify-result (contract-call? loan-verifier-contract is-verified tx-sender)))
      (asserts! verify-result (err ERR-NOT-AUTHORIZED)))

    (let ((loan-id (var-get next-loan-id))
          (block-height (as-max u4294967295 block-height)))
      (map-set loan-requests
        loan-id
        {
          borrower: tx-sender,
          amount: amount,
          interest-rate: interest-rate,
          duration: duration,
          created-at: block-height,
          status: STATUS-PENDING
        })
      (var-set next-loan-id (+ loan-id u1))
      (ok loan-id)
    )
  )
)

;; Public: cancel loan request (only by creator)
(define-public (cancel-loan-request (loan-id uint))
  (match (map-get loan-requests loan-id)
    some-loan
      (begin
        (asserts! (is-eq tx-sender (get borrower some-loan)) (err ERR-NOT-AUTHORIZED))
        (asserts! (is-eq (get status some-loan) STATUS-PENDING) (err ERR-REQUEST-NOT-PENDING))
        (map-set loan-requests loan-id (merge some-loan { status: STATUS-CANCELLED }))
        (ok true)
      )
    none (err ERR-NO-REQUEST)
  )
)

;; Public: mark loan request as fulfilled (admin only)
(define-public (mark-fulfilled (loan-id uint))
  (match (map-get loan-requests loan-id)
    some-loan
      (begin
        (asserts! (is-admin) (err ERR-NOT-AUTHORIZED))
        (asserts! (is-eq (get status some-loan) STATUS-PENDING) (err ERR-REQUEST-NOT-PENDING))
        (map-set loan-requests loan-id (merge some-loan { status: STATUS-FULFILLED }))
        (ok true)
      )
    none (err ERR-NO-REQUEST)
  )
)

;; Read-only: get loan request
(define-read-only (get-loan-request (loan-id uint))
  (match (map-get loan-requests loan-id)
    some-loan (ok some-loan)
    none (err ERR-NO-REQUEST)
  )
)

;; Read-only: get next loan ID
(define-read-only (get-next-loan-id)
  (ok (var-get next-loan-id))
)

;; Read-only: get admin
(define-read-only (get-admin)
  (ok (var-get admin))
)
