export class EmailVO {
  readonly value: string;

  constructor(email: string) {
    if (!this.isValidEmail(email)) {
      throw new Error('Invalid email format');
    }
    this.value = email.toLowerCase();
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  toString(): string {
    return this.value;
  }

  equals(other: EmailVO): boolean {
    return this.value === other.value;
  }
}
