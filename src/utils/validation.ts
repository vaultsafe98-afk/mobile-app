export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  message?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export class FormValidator {
  private rules: Record<string, ValidationRule[]> = {};

  addRule(fieldName: string, rule: ValidationRule) {
    if (!this.rules[fieldName]) {
      this.rules[fieldName] = [];
    }
    this.rules[fieldName].push(rule);
  }

  validateField(fieldName: string, value: any): string | null {
    const fieldRules = this.rules[fieldName] || [];
    
    for (const rule of fieldRules) {
      const error = this.validateRule(value, rule);
      if (error) {
        return error;
      }
    }
    
    return null;
  }

  validateForm(data: Record<string, any>): ValidationResult {
    const errors: Record<string, string> = {};
    let isValid = true;

    for (const fieldName in this.rules) {
      const value = data[fieldName];
      const error = this.validateField(fieldName, value);
      
      if (error) {
        errors[fieldName] = error;
        isValid = false;
      }
    }

    return { isValid, errors };
  }

  private validateRule(value: any, rule: ValidationRule): string | null {
    // Required validation
    if (rule.required && (!value || value.toString().trim() === '')) {
      return rule.message || `${this.getFieldName(rule)} is required`;
    }

    // Skip other validations if value is empty and not required
    if (!value || value.toString().trim() === '') {
      return null;
    }

    // Min length validation
    if (rule.minLength && value.toString().length < rule.minLength) {
      return rule.message || `${this.getFieldName(rule)} must be at least ${rule.minLength} characters`;
    }

    // Max length validation
    if (rule.maxLength && value.toString().length > rule.maxLength) {
      return rule.message || `${this.getFieldName(rule)} must be no more than ${rule.maxLength} characters`;
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value.toString())) {
      return rule.message || `${this.getFieldName(rule)} format is invalid`;
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(value);
      if (customError) {
        return customError;
      }
    }

    return null;
  }

  private getFieldName(rule: ValidationRule): string {
    return rule.message ? rule.message.split(' ')[0] : 'This field';
  }
}

// Common validation patterns
export const ValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\+]?[1-9][\d]{0,15}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  walletAddress: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^0x[a-fA-F0-9]{40}$/,
  usdtAddress: /^T[A-Za-z1-9]{33}$/,
  amount: /^\d+(\.\d{1,2})?$/,
};

// Predefined validators for common fields
export const createEmailValidator = (): ValidationRule[] => [
  {
    required: true,
    pattern: ValidationPatterns.email,
    message: 'Please enter a valid email address',
  },
];

export const createPasswordValidator = (): ValidationRule[] => [
  {
    required: true,
    minLength: 6,
    message: 'Password must be at least 6 characters',
  },
  {
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  },
];

export const createNameValidator = (fieldName: string): ValidationRule[] => [
  {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s]+$/,
    message: `${fieldName} must be 2-50 characters and contain only letters`,
  },
];

export const createAmountValidator = (): ValidationRule[] => [
  {
    required: true,
    pattern: ValidationPatterns.amount,
    message: 'Please enter a valid amount',
  },
  {
    custom: (value) => {
      const amount = parseFloat(value);
      if (isNaN(amount) || amount <= 0) {
        return 'Amount must be greater than 0';
      }
      if (amount > 1000000) {
        return 'Amount cannot exceed $1,000,000';
      }
      return null;
    },
  },
];

export const createWalletAddressValidator = (): ValidationRule[] => [
  {
    required: true,
    minLength: 26,
    maxLength: 42,
    message: 'Please enter a valid wallet address',
  },
  {
    custom: (value) => {
      // Basic wallet address validation
      if (!/^[a-zA-Z0-9]+$/.test(value)) {
        return 'Wallet address contains invalid characters';
      }
      return null;
    },
  },
];

// Form-specific validators
export const createLoginValidator = (): FormValidator => {
  const validator = new FormValidator();
  validator.addRule('email', ...createEmailValidator());
  validator.addRule('password', ...createPasswordValidator());
  return validator;
};

export const createRegisterValidator = (): FormValidator => {
  const validator = new FormValidator();
  validator.addRule('firstName', ...createNameValidator('First name'));
  validator.addRule('lastName', ...createNameValidator('Last name'));
  validator.addRule('email', ...createEmailValidator());
  validator.addRule('password', ...createPasswordValidator());
  validator.addRule('confirmPassword', {
    required: true,
    message: 'Please confirm your password',
  });
  return validator;
};

export const createDepositValidator = (): FormValidator => {
  const validator = new FormValidator();
  // Deposit doesn't need validation as it's just image upload
  return validator;
};

export const createWithdrawValidator = (): FormValidator => {
  const validator = new FormValidator();
  validator.addRule('amount', ...createAmountValidator());
  validator.addRule('platform', {
    required: true,
    message: 'Please select a platform',
  });
  validator.addRule('walletAddress', ...createWalletAddressValidator());
  return validator;
};
