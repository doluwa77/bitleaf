import { describe, it, expect, beforeEach } from 'vitest';

// Define types for clarity
interface Loan {
  id: number;
  borrower: string;
  amount: bigint;
  interestRate: number;
  duration: number;
  status: 'pending' | 'cancelled' | 'fulfilled';
}

interface MockContract {
  admin: string;
  loanCounter: number;
  loans: Map<number, Loan>;

  createLoanRequest(
    sender: string,
    amount: bigint,
    interestRate: number,
    duration: number
  ): { value?: number; error?: number };

  cancelLoanRequest(sender: string, loanId: number): { value?: boolean; error?: number };

  markFulfilled(sender: string, loanId: number): { value?: boolean; error?: number };

  getLoanRequest(loanId: number): { value?: Loan; error?: number };

  transferAdmin(sender: string, newAdmin: string): { value?: boolean; error?: number };
}

const ERR_NOT_AUTHORIZED = 100;
const ERR_NO_REQUEST = 101;
const ERR_INVALID_BORROWER = 102;
const ERR_ZERO_ADDRESS = 103;

const mockContract: MockContract = {
  admin: 'ST1ADMIN111111111111111111111111111111111',
  loanCounter: 0,
  loans: new Map(),

  createLoanRequest(sender, amount, interestRate, duration) {
    const id = ++this.loanCounter;
    const loan: Loan = {
      id,
      borrower: sender,
      amount,
      interestRate,
      duration,
      status: 'pending',
    };
    this.loans.set(id, loan);
    return { value: id };
  },

  cancelLoanRequest(sender, loanId) {
    const loan = this.loans.get(loanId);
    if (!loan) return { error: ERR_NO_REQUEST };
    if (loan.borrower !== sender) return { error: ERR_INVALID_BORROWER };
    loan.status = 'cancelled';
    this.loans.set(loanId, loan);
    return { value: true };
  },

  markFulfilled(sender, loanId) {
    if (sender !== this.admin) return { error: ERR_NOT_AUTHORIZED };
    const loan = this.loans.get(loanId);
    if (!loan) return { error: ERR_NO_REQUEST };
    loan.status = 'fulfilled';
    this.loans.set(loanId, loan);
    return { value: true };
  },

  getLoanRequest(loanId) {
    const loan = this.loans.get(loanId);
    if (!loan) return { error: ERR_NO_REQUEST };
    return { value: loan };
  },

  transferAdmin(sender, newAdmin) {
    if (sender !== this.admin) return { error: ERR_NOT_AUTHORIZED };
    if (newAdmin === 'SP000000000000000000002Q6VF78') return { error: ERR_ZERO_ADDRESS };
    this.admin = newAdmin;
    return { value: true };
  },
};

describe('Loan Request Contract', () => {
  beforeEach(() => {
    mockContract.loanCounter = 0;
    mockContract.loans.clear();
    mockContract.admin = 'ST1ADMIN111111111111111111111111111111111';
  });

  it('should create a loan request', () => {
    const result = mockContract.createLoanRequest('ST2USER...', 1_000_000n, 5, 30);
    expect(result.value).toBe(1);
    const loan = mockContract.loans.get(1);
    expect(loan).toBeDefined();
    expect(loan?.status).toBe('pending');
  });

  it('should cancel a loan request by borrower', () => {
    const { value: loanId } = mockContract.createLoanRequest('ST2USER...', 1_000_000n, 5, 30);
    const result = mockContract.cancelLoanRequest('ST2USER...', loanId!);
    expect(result).toEqual({ value: true });
    expect(mockContract.loans.get(loanId!)?.status).toBe('cancelled');
  });

  it('should not cancel a loan not owned by sender', () => {
    const { value: loanId } = mockContract.createLoanRequest('ST2USER...', 1_000_000n, 5, 30);
    const result = mockContract.cancelLoanRequest('ST3OTHER...', loanId!);
    expect(result).toEqual({ error: ERR_INVALID_BORROWER });
  });

  it('should mark a loan as fulfilled by admin', () => {
    const { value: loanId } = mockContract.createLoanRequest('ST2USER...', 1_000_000n, 5, 30);
    const result = mockContract.markFulfilled(mockContract.admin, loanId!);
    expect(result).toEqual({ value: true });
    expect(mockContract.loans.get(loanId!)?.status).toBe('fulfilled');
  });

  it('should not allow non-admin to mark fulfilled', () => {
    const { value: loanId } = mockContract.createLoanRequest('ST2USER...', 1_000_000n, 5, 30);
    const result = mockContract.markFulfilled('ST4USER...', loanId!);
    expect(result).toEqual({ error: ERR_NOT_AUTHORIZED });
  });

  it('should transfer admin rights', () => {
    const result = mockContract.transferAdmin(mockContract.admin, 'ST5NEWADMIN...');
    expect(result).toEqual({ value: true });
    expect(mockContract.admin).toBe('ST5NEWADMIN...');
  });

  it('should reject zero address admin transfer', () => {
    const result = mockContract.transferAdmin(mockContract.admin, 'SP000000000000000000002Q6VF78');
    expect(result).toEqual({ error: ERR_ZERO_ADDRESS });
  });
});
