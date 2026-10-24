# OpenIQ Critical Item Rewrite — Draft Candidate

**Status: draft only; not approved for pilot or participant administration.**

This file rewrites seven critical items from the supplied snapshot. Other 25 items were retained unchanged and have not been newly validated. The old digest was removed because edits invalidate it; do not treat this file as cryptographically verified. Re-import and regenerate integrity metadata through the app’s supported workflow.

## Changes

### AI-0013

**Issue addressed:** Rewritten to replace an unsolved/inconsistent example cipher with a fully specified rule. Must be independently reviewed.

**Revised prompt:** In this code, each letter is replaced by the letter two places later in the alphabet. After Z, the alphabet wraps around to A. For example, A becomes C and Y becomes A. How is ADVANTAGE coded?

**Keyed answer:** CFXCPVCIG

**Explanation:** Shift each letter forward by two places: A→C, D→F, V→X, A→C, N→P, T→V, A→C, G→I, E→G. The result is CFXCPVCIG.

### AI-0018

**Issue addressed:** Rewritten with constraints that determine one exact order; independent review still required.

**Revised prompt:** Five books P, Q, R, S, and T are stacked from top to bottom. P is immediately above Q. R is immediately below Q. T is immediately above S, and S is the bottom book. What is the exact order from top to bottom?

**Keyed answer:** P, Q, R, T, S

**Explanation:** P is immediately above Q and R is immediately below Q, so the first three books are P, Q, R. S is at the bottom and T is immediately above S, leaving T and S in fourth and fifth positions. The order is P, Q, R, T, S.

### AI-0019

**Issue addressed:** Rewritten so the stated classification rule is explicit and exactly one option differs.

**Revised prompt:** Three of the number pairs below have a difference of 24. Which pair is the exception?

**Keyed answer:** 83 - 60

**Explanation:** The first three pairs each differ by 24: 71−47=24, 63−39=24, and 52−28=24. The last pair differs by 23: 83−60=23.

### AI-0020

**Issue addressed:** Rewritten to remove the prior contradictory/underconstrained seating inference. This version is very easy and should be replaced with a genuinely discriminating seating item before research use.

**Revised prompt:** Six people A, B, C, D, E, and F sit in six seats around a round table. For this question, clockwise and counterclockwise are viewed from above the table. A sits opposite D. B sits immediately clockwise from A. C sits opposite B. E sits immediately counterclockwise from D. Who sits immediately counterclockwise from D?

**Keyed answer:** E

**Explanation:** The question directly states that E sits immediately counterclockwise from D, so the answer is E.

### AI-0022

**Issue addressed:** Corrected the definition of $ to brother so the keyed expression follows the stated relationships. Independent review still required.

**Revised prompt:** In a family-code system, 'P @ Q' means P is the mother of Q, 'P # Q' means P is the father of Q, and 'P $ Q' means P is the brother of Q. Which expression shows that M is the paternal uncle of N?

**Keyed answer:** M $ K # N

**Explanation:** In M $ K, M is the brother of K. In K # N, K is the father of N. Therefore M is the brother of N's father, so M is N's paternal uncle.

### AI-0023

**Issue addressed:** Rewritten to use a consistent one-to-one letter-digit mapping and examples that agree with it.

**Revised prompt:** In a code, each letter is represented by a fixed digit: A=1, C=3, E=5, N=7, and T=8. For example, CANE is coded as 3175 and TENT is coded as 8578. How is CENT coded?

**Keyed answer:** 3578

**Explanation:** Using the stated mapping, C=3, E=5, N=7, and T=8. Therefore CENT is coded as 3578.

### AI-0032

**Issue addressed:** Replaced the item requiring an absent visual stimulus with a fully specified text-only spatial sequence.

**Revised prompt:** A marker moves one cell clockwise around the outer edge of a 3×3 grid. Its positions so far are: top-left, top-middle, top-right, middle-right, bottom-right, __. Which position comes next?

**Keyed answer:** Bottom-middle

**Explanation:** Following the outer edge clockwise from top-left gives top-middle, top-right, middle-right, bottom-right, then bottom-middle.

## Mandatory next steps

1. Have an independent reviewer solve each item without seeing its key.
2. Test the new candidate in the pilot runner, including option indexing and export.
3. Confirm all seven revised items and the remaining items pass content review.
4. Regenerate a valid SHA-256 digest using the app’s actual supported algorithm and format; do not manually copy the old 8-character checksum.
5. Keep participant collection and IQ-score generation disabled until protocol, consent, privacy, ethics, and validation requirements are satisfied.

The rewrite improves item clarity and key consistency but does not establish psychometric quality or validity.
