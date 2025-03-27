
# Plan for Calculating Fibonacci Numbers

**Objective:**
To write a Python function named `calculate_fibonacci(n)` that computes the nth Fibonacci number.

**Fibonacci Sequence Definition:**
- F(0) = 0
- F(1) = 1
- F(n) = F(n-1) + F(n-2) for n >= 2

**Approaches to Consider:**
1. **Recursive Approach:** Simple but inefficient for large `n` due to repeated calculations.
2. **Iterative Approach:** Efficient and easy to understand, suitable for most use cases.
3. **Memoization:** Optimizes the recursive approach by storing previously calculated results.

For simplicity and efficiency, we will implement an iterative approach in this plan.

**Steps:**
1. Define the function `calculate_fibonacci(n)`.
2. Handle edge cases where `n` is 0 or 1.
3. Use a loop to calculate Fibonacci numbers iteratively from 2 up to `n`.
4. Return the nth Fibonacci number.

**Implementation Considerations:**
- Ensure that `n` is a non-negative integer.
- Optimize for readability and performance.
