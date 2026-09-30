import { prisma } from "./prisma";

export interface ValidationResult {
  isValid: boolean;
  isSuspicious: boolean;
  flagReason?: string;
  errorMessage?: string;
}

export class SubmissionValidator {
  /**
   * Validate GAT / VTU USN patterns:
   * Standard: e.g. 1GA21CS001, 1GA22IS045
   * 1st Year Temporary: e.g. 1GA25CS176-T, 1GA26IS001-T, 1GA24AI050-T, 1GAXXCS176-T
   */
  static validateUSN(usn: string, year?: number): { isValid: boolean; isTemporary: boolean; error?: string } {
    if (!usn || !usn.trim()) {
      return { isValid: false, isTemporary: false, error: "USN / Student ID is required." };
    }

    const clean = usn.trim().toUpperCase();

    // 1st Year temporary format: e.g. 1GA25CS176-T, 1GAXXCS176-T, 1GA26AI012-T
    const tempUSNRegex = /^1GA[0-9A-Z]{2}[A-Z]{2,3}[0-9]{2,3}-T$/i;

    // Standard VTU format: e.g. 1GA21CS001, 1GA22IS050
    const standardUSNRegex = /^1GA[0-9]{2}[A-Z]{2,3}[0-9]{3}$/i;

    if (tempUSNRegex.test(clean)) {
      return { isValid: true, isTemporary: true };
    }

    if (standardUSNRegex.test(clean)) {
      return { isValid: true, isTemporary: false };
    }

    return {
      isValid: false,
      isTemporary: false,
      error: "Invalid USN format. Use standard (e.g. 1GA22CS089) or 1st year temporary format (e.g. 1GA25CS176-T).",
    };
  }
  /**
   * Validate platform and URL structure
   */
  static verifyPlatform(url: string, platform: string): boolean {
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.toLowerCase();
      if (platform.toLowerCase().includes("leetcode")) {
        return host.includes("leetcode.com");
      }
      if (platform.toLowerCase().includes("codechef")) {
        return host.includes("codechef.com");
      }
      if (platform.toLowerCase().includes("hackerrank")) {
        return host.includes("hackerrank.com");
      }
      if (platform.toLowerCase().includes("geeksforgeeks") || platform.toLowerCase().includes("gfg")) {
        return host.includes("geeksforgeeks.org");
      }
      // Allow valid github / gist or code links as proof
      return host.includes("github.com") || host.includes("gitlab.com");
    } catch {
      return false;
    }
  }

  /**
   * Check for duplicate submissions across users or same user
   */
  static async detectDuplicate(solutionUrl: string, userId: string, challengeId: string): Promise<{ isDuplicate: boolean; duplicateOwner?: string }> {
    const existing = await prisma.submission.findFirst({
      where: {
        solutionUrl: solutionUrl.trim(),
        challengeId,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!existing) {
      return { isDuplicate: false };
    }

    if (existing.userId === userId) {
      return { isDuplicate: true, duplicateOwner: "self" };
    }

    return { isDuplicate: true, duplicateOwner: existing.user.name };
  }

  /**
   * Comprehensive validation run before creating or approving submission
   */
  static async validateSubmission(params: {
    userId: string;
    challengeId: string;
    solutionUrl: string;
    platform: string;
  }): Promise<ValidationResult> {
    const { userId, challengeId, solutionUrl, platform } = params;

    if (!solutionUrl || !solutionUrl.trim().startsWith("http")) {
      return {
        isValid: false,
        isSuspicious: false,
        errorMessage: "Please enter a valid, complete solution URL starting with http:// or https://",
      };
    }

    const isPlatformOk = this.verifyPlatform(solutionUrl, platform);
    if (!isPlatformOk) {
      return {
        isValid: true,
        isSuspicious: true,
        flagReason: `URL does not match standard ${platform} host patterns. Manual verification advised.`,
      };
    }

    // Check duplicate
    const duplicateCheck = await this.detectDuplicate(solutionUrl, userId, challengeId);
    if (duplicateCheck.isDuplicate) {
      if (duplicateCheck.duplicateOwner === "self") {
        return {
          isValid: false,
          isSuspicious: false,
          errorMessage: "You have already submitted this solution URL for this challenge.",
        };
      } else {
        // Suspected plagiarized or shared submission
        return {
          isValid: true,
          isSuspicious: true,
          flagReason: `Potential duplicate submission: identical URL already submitted by participant "${duplicateCheck.duplicateOwner}".`,
        };
      }
    }

    return {
      isValid: true,
      isSuspicious: false,
    };
  }
}
