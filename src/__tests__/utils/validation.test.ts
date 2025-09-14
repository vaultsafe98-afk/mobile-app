import { FormValidator, ValidationPatterns, createEmailValidator, createPasswordValidator } from '../../utils/validation';

describe('FormValidator', () => {
  let validator: FormValidator;

  beforeEach(() => {
    validator = new FormValidator();
  });

  describe('Required validation', () => {
    it('should return error for empty required field', () => {
      validator.addRule('email', { required: true });
      const error = validator.validateField('email', '');
      expect(error).toBe('This field is required');
    });

    it('should return null for non-empty required field', () => {
      validator.addRule('email', { required: true });
      const error = validator.validateField('email', 'test@example.com');
      expect(error).toBeNull();
    });
  });

  describe('Length validation', () => {
    it('should return error for field shorter than minLength', () => {
      validator.addRule('password', { minLength: 6 });
      const error = validator.validateField('password', '123');
      expect(error).toBe('This field must be at least 6 characters');
    });

    it('should return error for field longer than maxLength', () => {
      validator.addRule('name', { maxLength: 10 });
      const error = validator.validateField('name', 'verylongname');
      expect(error).toBe('This field must be no more than 10 characters');
    });
  });

  describe('Pattern validation', () => {
    it('should return error for invalid email pattern', () => {
      validator.addRule('email', { pattern: ValidationPatterns.email });
      const error = validator.validateField('email', 'invalid-email');
      expect(error).toBe('This field format is invalid');
    });

    it('should return null for valid email pattern', () => {
      validator.addRule('email', { pattern: ValidationPatterns.email });
      const error = validator.validateField('email', 'test@example.com');
      expect(error).toBeNull();
    });
  });

  describe('Custom validation', () => {
    it('should return custom error message', () => {
      validator.addRule('age', {
        custom: (value) => {
          const age = parseInt(value);
          if (isNaN(age) || age < 18) {
            return 'Age must be at least 18';
          }
          return null;
        }
      });
      const error = validator.validateField('age', '16');
      expect(error).toBe('Age must be at least 18');
    });
  });

  describe('Form validation', () => {
    it('should validate entire form', () => {
      validator.addRule('email', { required: true, pattern: ValidationPatterns.email });
      validator.addRule('password', { required: true, minLength: 6 });

      const result = validator.validateForm({
        email: 'test@example.com',
        password: '123456'
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should return errors for invalid form', () => {
      validator.addRule('email', { required: true, pattern: ValidationPatterns.email });
      validator.addRule('password', { required: true, minLength: 6 });

      const result = validator.validateForm({
        email: 'invalid-email',
        password: '123'
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('email');
      expect(result.errors).toHaveProperty('password');
    });
  });
});

describe('Validation Patterns', () => {
  describe('Email pattern', () => {
    it('should match valid emails', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org'
      ];
      validEmails.forEach(email => {
        expect(ValidationPatterns.email.test(email)).toBe(true);
      });
    });

    it('should not match invalid emails', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test.example.com'
      ];
      invalidEmails.forEach(email => {
        expect(ValidationPatterns.email.test(email)).toBe(false);
      });
    });
  });

  describe('Amount pattern', () => {
    it('should match valid amounts', () => {
      const validAmounts = ['100', '100.50', '0.99', '1000.00'];
      validAmounts.forEach(amount => {
        expect(ValidationPatterns.amount.test(amount)).toBe(true);
      });
    });

    it('should not match invalid amounts', () => {
      const invalidAmounts = ['abc', '100.999', '100,50', '-100'];
      invalidAmounts.forEach(amount => {
        expect(ValidationPatterns.amount.test(amount)).toBe(false);
      });
    });
  });
});

describe('Predefined validators', () => {
  describe('Email validator', () => {
    it('should validate email correctly', () => {
      const validator = new FormValidator();
      validator.addRule('email', ...createEmailValidator());

      expect(validator.validateField('email', 'test@example.com')).toBeNull();
      expect(validator.validateField('email', 'invalid-email')).toBe('Please enter a valid email address');
      expect(validator.validateField('email', '')).toBe('Please enter a valid email address');
    });
  });

  describe('Password validator', () => {
    it('should validate password correctly', () => {
      const validator = new FormValidator();
      validator.addRule('password', ...createPasswordValidator());

      expect(validator.validateField('password', 'Password123')).toBeNull();
      expect(validator.validateField('password', '123')).toBe('Password must be at least 6 characters');
      expect(validator.validateField('password', 'password')).toBe('Password must contain at least one uppercase letter, one lowercase letter, and one number');
    });
  });
});
