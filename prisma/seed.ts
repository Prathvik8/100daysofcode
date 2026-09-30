import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEFAULT_BADGES = [
  {
    slug: "challenger",
    name: "Challenger",
    description: "Completed Day 1 of CODE100.",
    icon: "Rocket",
    criteria: "Complete Day 1",
    rarity: "COMMON",
  },
  {
    slug: "7-day-streak",
    name: "7-Day Streak",
    description: "Maintained a consistent 7-day streak.",
    icon: "Flame",
    criteria: "7 consecutive days solved",
    rarity: "COMMON",
  },
  {
    slug: "14-day-streak",
    name: "14-Day Streak",
    description: "Two weeks of relentless problem-solving.",
    icon: "Zap",
    criteria: "14 consecutive days solved",
    rarity: "RARE",
  },
  {
    slug: "30-day-streak",
    name: "30-Day Streak",
    description: "One whole month of unwavering commitment.",
    icon: "Award",
    criteria: "30 consecutive days solved",
    rarity: "RARE",
  },
  {
    slug: "50-day-streak",
    name: "50-Day Streak",
    description: "Halfway through the grand journey!",
    icon: "Crown",
    criteria: "50 consecutive days solved",
    rarity: "EPIC",
  },
  {
    slug: "75-day-streak",
    name: "75-Day Streak",
    description: "Elite endurance and master coder status.",
    icon: "ShieldAlert",
    criteria: "75 consecutive days solved",
    rarity: "EPIC",
  },
  {
    slug: "100-day-warrior",
    name: "100-Day Warrior",
    description: "Conquered all 100 days of CODE100. Legend of GAT ACM!",
    icon: "Trophy",
    criteria: "Complete all 100 official challenges",
    rarity: "LEGENDARY",
  },
  {
    slug: "problem-solver",
    name: "Problem Solver",
    description: "Successfully solved 25 challenges.",
    icon: "Code2",
    criteria: "Solve 25 challenges",
    rarity: "COMMON",
  },
  {
    slug: "hard-coder",
    name: "Hard Coder",
    description: "Crushed 10 Hard-level challenges.",
    icon: "Cpu",
    criteria: "Solve 10 Hard challenges",
    rarity: "EPIC",
  },
  {
    slug: "comeback-kid",
    name: "Comeback Kid",
    description: "Recovered a broken streak using a recovery token.",
    icon: "RefreshCw",
    criteria: "Use a recovery token to restore streak",
    rarity: "RARE",
  },
];

const DSA_CURRICULUM = [
  // Days 1-15: Arrays & Strings
  { topic: "Arrays & Strings", title: "Two Sum", difficulty: "EASY", url: "https://leetcode.com/problems/two-sum/" },
  { topic: "Arrays & Strings", title: "Best Time to Buy and Sell Stock", difficulty: "EASY", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/" },
  { topic: "Arrays & Strings", title: "Contains Duplicate", difficulty: "EASY", url: "https://leetcode.com/problems/contains-duplicate/" },
  { topic: "Arrays & Strings", title: "Product of Array Except Self", difficulty: "MEDIUM", url: "https://leetcode.com/problems/product-of-array-except-self/" },
  { topic: "Arrays & Strings", title: "Maximum Subarray (Kadane's)", difficulty: "MEDIUM", url: "https://leetcode.com/problems/maximum-subarray/" },
  { topic: "Arrays & Strings", title: "Maximum Product Subarray", difficulty: "MEDIUM", url: "https://leetcode.com/problems/maximum-product-subarray/" },
  { topic: "Arrays & Strings", title: "Find Minimum in Rotated Sorted Array", difficulty: "MEDIUM", url: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/" },
  { topic: "Arrays & Strings", title: "Search in Rotated Sorted Array", difficulty: "MEDIUM", url: "https://leetcode.com/problems/search-in-rotated-sorted-array/" },
  { topic: "Arrays & Strings", title: "3Sum", difficulty: "MEDIUM", url: "https://leetcode.com/problems/3sum/" },
  { topic: "Arrays & Strings", title: "Container With Most Water", difficulty: "MEDIUM", url: "https://leetcode.com/problems/container-with-most-water/" },
  { topic: "Arrays & Strings", title: "Valid Anagram", difficulty: "EASY", url: "https://leetcode.com/problems/valid-anagram/" },
  { topic: "Arrays & Strings", title: "Group Anagrams", difficulty: "MEDIUM", url: "https://leetcode.com/problems/group-anagrams/" },
  { topic: "Arrays & Strings", title: "Valid Parentheses", difficulty: "EASY", url: "https://leetcode.com/problems/valid-parentheses/" },
  { topic: "Arrays & Strings", title: "Valid Palindrome", difficulty: "EASY", url: "https://leetcode.com/problems/valid-palindrome/" },
  { topic: "Arrays & Strings", title: "Longest Palindromic Substring", difficulty: "MEDIUM", url: "https://leetcode.com/problems/longest-palindromic-substring/" },

  // Days 16-30: Searching, Sorting & Hashing
  { topic: "Searching, Sorting & Hashing", title: "Binary Search", difficulty: "EASY", url: "https://leetcode.com/problems/binary-search/" },
  { topic: "Searching, Sorting & Hashing", title: "First Bad Version", difficulty: "EASY", url: "https://leetcode.com/problems/first-bad-version/" },
  { topic: "Searching, Sorting & Hashing", title: "Search a 2D Matrix", difficulty: "MEDIUM", url: "https://leetcode.com/problems/search-a-2d-matrix/" },
  { topic: "Searching, Sorting & Hashing", title: "Koko Eating Bananas", difficulty: "MEDIUM", url: "https://leetcode.com/problems/koko-eating-bananas/" },
  { topic: "Searching, Sorting & Hashing", title: "Find Peak Element", difficulty: "MEDIUM", url: "https://leetcode.com/problems/find-peak-element/" },
  { topic: "Searching, Sorting & Hashing", title: "Median of Two Sorted Arrays", difficulty: "HARD", url: "https://leetcode.com/problems/median-of-two-sorted-arrays/" },
  { topic: "Searching, Sorting & Hashing", title: "Top K Frequent Elements", difficulty: "MEDIUM", url: "https://leetcode.com/problems/top-k-frequent-elements/" },
  { topic: "Searching, Sorting & Hashing", title: "Sort Colors (Dutch National Flag)", difficulty: "MEDIUM", url: "https://leetcode.com/problems/sort-colors/" },
  { topic: "Searching, Sorting & Hashing", title: "Merge Intervals", difficulty: "MEDIUM", url: "https://leetcode.com/problems/merge-intervals/" },
  { topic: "Searching, Sorting & Hashing", title: "Non-overlapping Intervals", difficulty: "MEDIUM", url: "https://leetcode.com/problems/non-overlapping-intervals/" },
  { topic: "Searching, Sorting & Hashing", title: "Insert Interval", difficulty: "MEDIUM", url: "https://leetcode.com/problems/insert-interval/" },
  { topic: "Searching, Sorting & Hashing", title: "Subarray Sum Equals K", difficulty: "MEDIUM", url: "https://leetcode.com/problems/subarray-sum-equals-k/" },
  { topic: "Searching, Sorting & Hashing", title: "Longest Consecutive Sequence", difficulty: "MEDIUM", url: "https://leetcode.com/problems/longest-consecutive-sequence/" },
  { topic: "Searching, Sorting & Hashing", title: "Encode and Decode Strings", difficulty: "MEDIUM", url: "https://leetcode.com/problems/encode-and-decode-strings/" },
  { topic: "Searching, Sorting & Hashing", title: "Meeting Rooms II", difficulty: "MEDIUM", url: "https://leetcode.com/problems/meeting-rooms-ii/" },

  // Days 31-45: Two Pointer, Sliding Window & Prefix Sum
  { topic: "Two Pointer, Sliding Window & Prefix Sum", title: "Longest Substring Without Repeating Characters", difficulty: "MEDIUM", url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/" },
  { topic: "Two Pointer, Sliding Window & Prefix Sum", title: "Longest Repeating Character Replacement", difficulty: "MEDIUM", url: "https://leetcode.com/problems/longest-repeating-character-replacement/" },
  { topic: "Two Pointer, Sliding Window & Prefix Sum", title: "Minimum Window Substring", difficulty: "HARD", url: "https://leetcode.com/problems/minimum-window-substring/" },
  { topic: "Two Pointer, Sliding Window & Prefix Sum", title: "Permutation in String", difficulty: "MEDIUM", url: "https://leetcode.com/problems/permutation-in-string/" },
  { topic: "Two Pointer, Sliding Window & Prefix Sum", title: "Sliding Window Maximum", difficulty: "HARD", url: "https://leetcode.com/problems/sliding-window-maximum/" },
  { topic: "Two Pointer, Sliding Window & Prefix Sum", title: "Trapping Rain Water", difficulty: "HARD", url: "https://leetcode.com/problems/trapping-rain-water/" },
  { topic: "Two Pointer, Sliding Window & Prefix Sum", title: "Two Sum II - Input Array Is Sorted", difficulty: "MEDIUM", url: "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/" },
  { topic: "Two Pointer, Sliding Window & Prefix Sum", title: "Move Zeroes", difficulty: "EASY", url: "https://leetcode.com/problems/move-zeroes/" },
  { topic: "Two Pointer, Sliding Window & Prefix Sum", title: "Squares of a Sorted Array", difficulty: "EASY", url: "https://leetcode.com/problems/squares-of-a-sorted-array/" },
  { topic: "Two Pointer, Sliding Window & Prefix Sum", title: "Boats to Save People", difficulty: "MEDIUM", url: "https://leetcode.com/problems/boats-to-save-people/" },
  { topic: "Two Pointer, Sliding Window & Prefix Sum", title: "Fruit Into Baskets", difficulty: "MEDIUM", url: "https://leetcode.com/problems/fruit-into-baskets/" },
  { topic: "Two Pointer, Sliding Window & Prefix Sum", title: "Minimum Size Subarray Sum", difficulty: "MEDIUM", url: "https://leetcode.com/problems/minimum-size-subarray-sum/" },
  { topic: "Two Pointer, Sliding Window & Prefix Sum", title: "Find All Anagrams in a String", difficulty: "MEDIUM", url: "https://leetcode.com/problems/find-all-anagrams-in-a-string/" },
  { topic: "Two Pointer, Sliding Window & Prefix Sum", title: "Contiguous Array", difficulty: "MEDIUM", url: "https://leetcode.com/problems/contiguous-array/" },
  { topic: "Two Pointer, Sliding Window & Prefix Sum", title: "Range Sum Query - Immutable", difficulty: "EASY", url: "https://leetcode.com/problems/range-sum-query-immutable/" },

  // Days 46-60: Linked Lists, Stack & Queue
  { topic: "Linked Lists, Stack & Queue", title: "Reverse Linked List", difficulty: "EASY", url: "https://leetcode.com/problems/reverse-linked-list/" },
  { topic: "Linked Lists, Stack & Queue", title: "Merge Two Sorted Lists", difficulty: "EASY", url: "https://leetcode.com/problems/merge-two-sorted-lists/" },
  { topic: "Linked Lists, Stack & Queue", title: "Reorder List", difficulty: "MEDIUM", url: "https://leetcode.com/problems/reorder-list/" },
  { topic: "Linked Lists, Stack & Queue", title: "Remove Nth Node From End of List", difficulty: "MEDIUM", url: "https://leetcode.com/problems/remove-nth-node-from-end-of-list/" },
  { topic: "Linked Lists, Stack & Queue", title: "Linked List Cycle", difficulty: "EASY", url: "https://leetcode.com/problems/linked-list-cycle/" },
  { topic: "Linked Lists, Stack & Queue", title: "Merge k Sorted Lists", difficulty: "HARD", url: "https://leetcode.com/problems/merge-k-sorted-lists/" },
  { topic: "Linked Lists, Stack & Queue", title: "Min Stack", difficulty: "MEDIUM", url: "https://leetcode.com/problems/min-stack/" },
  { topic: "Linked Lists, Stack & Queue", title: "Evaluate Reverse Polish Notation", difficulty: "MEDIUM", url: "https://leetcode.com/problems/evaluate-reverse-polish-notation/" },
  { topic: "Linked Lists, Stack & Queue", title: "Daily Temperatures", difficulty: "MEDIUM", url: "https://leetcode.com/problems/daily-temperatures/" },
  { topic: "Linked Lists, Stack & Queue", title: "Generate Parentheses", difficulty: "MEDIUM", url: "https://leetcode.com/problems/generate-parentheses/" },
  { topic: "Linked Lists, Stack & Queue", title: "Largest Rectangle in Histogram", difficulty: "HARD", url: "https://leetcode.com/problems/largest-rectangle-in-histogram/" },
  { topic: "Linked Lists, Stack & Queue", title: "Implement Queue using Stacks", difficulty: "EASY", url: "https://leetcode.com/problems/implement-queue-using-stacks/" },
  { topic: "Linked Lists, Stack & Queue", title: "Asteroid Collision", difficulty: "MEDIUM", url: "https://leetcode.com/problems/asteroid-collision/" },
  { topic: "Linked Lists, Stack & Queue", title: "Online Stock Span", difficulty: "MEDIUM", url: "https://leetcode.com/problems/online-stock-span/" },
  { topic: "Linked Lists, Stack & Queue", title: "Copy List with Random Pointer", difficulty: "MEDIUM", url: "https://leetcode.com/problems/copy-list-with-random-pointer/" },

  // Days 61-75: Trees, BST & Heaps
  { topic: "Trees, BST & Heaps", title: "Invert Binary Tree", difficulty: "EASY", url: "https://leetcode.com/problems/invert-binary-tree/" },
  { topic: "Trees, BST & Heaps", title: "Maximum Depth of Binary Tree", difficulty: "EASY", url: "https://leetcode.com/problems/maximum-depth-of-binary-tree/" },
  { topic: "Trees, BST & Heaps", title: "Same Tree", difficulty: "EASY", url: "https://leetcode.com/problems/same-tree/" },
  { topic: "Trees, BST & Heaps", title: "Subtree of Another Tree", difficulty: "EASY", url: "https://leetcode.com/problems/subtree-of-another-tree/" },
  { topic: "Trees, BST & Heaps", title: "Lowest Common Ancestor of a BST", difficulty: "MEDIUM", url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/" },
  { topic: "Trees, BST & Heaps", title: "Binary Tree Level Order Traversal", difficulty: "MEDIUM", url: "https://leetcode.com/problems/binary-tree-level-order-traversal/" },
  { topic: "Trees, BST & Heaps", title: "Validate Binary Search Tree", difficulty: "MEDIUM", url: "https://leetcode.com/problems/validate-binary-search-tree/" },
  { topic: "Trees, BST & Heaps", title: "Kth Smallest Element in a BST", difficulty: "MEDIUM", url: "https://leetcode.com/problems/kth-smallest-element-in-a-bst/" },
  { topic: "Trees, BST & Heaps", title: "Construct Binary Tree from Preorder and Inorder", difficulty: "MEDIUM", url: "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/" },
  { topic: "Trees, BST & Heaps", title: "Binary Tree Maximum Path Sum", difficulty: "HARD", url: "https://leetcode.com/problems/binary-tree-maximum-path-sum/" },
  { topic: "Trees, BST & Heaps", title: "Serialize and Deserialize Binary Tree", difficulty: "HARD", url: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/" },
  { topic: "Trees, BST & Heaps", title: "Kth Largest Element in a Stream", difficulty: "EASY", url: "https://leetcode.com/problems/kth-largest-element-in-a-stream/" },
  { topic: "Trees, BST & Heaps", title: "Last Stone Weight", difficulty: "EASY", url: "https://leetcode.com/problems/last-stone-weight/" },
  { topic: "Trees, BST & Heaps", title: "K Closest Points to Origin", difficulty: "MEDIUM", url: "https://leetcode.com/problems/k-closest-points-to-origin/" },
  { topic: "Trees, BST & Heaps", title: "Find Median from Data Stream", difficulty: "HARD", url: "https://leetcode.com/problems/find-median-from-data-stream/" },

  // Days 76-90: Graphs, Greedy, Backtracking & DP
  { topic: "Graphs, Greedy, Backtracking & DP", title: "Number of Islands", difficulty: "MEDIUM", url: "https://leetcode.com/problems/number-of-islands/" },
  { topic: "Graphs, Greedy, Backtracking & DP", title: "Clone Graph", difficulty: "MEDIUM", url: "https://leetcode.com/problems/clone-graph/" },
  { topic: "Graphs, Greedy, Backtracking & DP", title: "Pacific Atlantic Water Flow", difficulty: "MEDIUM", url: "https://leetcode.com/problems/pacific-atlantic-water-flow/" },
  { topic: "Graphs, Greedy, Backtracking & DP", title: "Course Schedule", difficulty: "MEDIUM", url: "https://leetcode.com/problems/course-schedule/" },
  { topic: "Graphs, Greedy, Backtracking & DP", title: "Course Schedule II", difficulty: "MEDIUM", url: "https://leetcode.com/problems/course-schedule-ii/" },
  { topic: "Graphs, Greedy, Backtracking & DP", title: "Rotting Oranges", difficulty: "MEDIUM", url: "https://leetcode.com/problems/rotting-oranges/" },
  { topic: "Graphs, Greedy, Backtracking & DP", title: "Word Ladder", difficulty: "HARD", url: "https://leetcode.com/problems/word-ladder/" },
  { topic: "Graphs, Greedy, Backtracking & DP", title: "Jump Game", difficulty: "MEDIUM", url: "https://leetcode.com/problems/jump-game/" },
  { topic: "Graphs, Greedy, Backtracking & DP", title: "Gas Station", difficulty: "MEDIUM", url: "https://leetcode.com/problems/gas-station/" },
  { topic: "Graphs, Greedy, Backtracking & DP", title: "Climbing Stairs", difficulty: "EASY", url: "https://leetcode.com/problems/climbing-stairs/" },
  { topic: "Graphs, Greedy, Backtracking & DP", title: "House Robber", difficulty: "MEDIUM", url: "https://leetcode.com/problems/house-robber/" },
  { topic: "Graphs, Greedy, Backtracking & DP", title: "House Robber II", difficulty: "MEDIUM", url: "https://leetcode.com/problems/house-robber-ii/" },
  { topic: "Graphs, Greedy, Backtracking & DP", title: "Coin Change", difficulty: "MEDIUM", url: "https://leetcode.com/problems/coin-change/" },
  { topic: "Graphs, Greedy, Backtracking & DP", title: "Longest Increasing Subsequence", difficulty: "MEDIUM", url: "https://leetcode.com/problems/longest-increasing-subsequence/" },
  { topic: "Graphs, Greedy, Backtracking & DP", title: "Word Break", difficulty: "MEDIUM", url: "https://leetcode.com/problems/word-break/" },

  // Days 91-100: Mixed Problems & Final Sprint
  { topic: "Mixed Problems & Final Sprint", title: "Combination Sum", difficulty: "MEDIUM", url: "https://leetcode.com/problems/combination-sum/" },
  { topic: "Mixed Problems & Final Sprint", title: "Subsets", difficulty: "MEDIUM", url: "https://leetcode.com/problems/subsets/" },
  { topic: "Mixed Problems & Final Sprint", title: "Permutations", difficulty: "MEDIUM", url: "https://leetcode.com/problems/permutations/" },
  { topic: "Mixed Problems & Final Sprint", title: "N-Queens", difficulty: "HARD", url: "https://leetcode.com/problems/n-queens/" },
  { topic: "Mixed Problems & Final Sprint", title: "Implement Trie (Prefix Tree)", difficulty: "MEDIUM", url: "https://leetcode.com/problems/implement-trie-prefix-tree/" },
  { topic: "Mixed Problems & Final Sprint", title: "Design Add and Search Words Data Structure", difficulty: "MEDIUM", url: "https://leetcode.com/problems/design-add-and-search-words-data-structure/" },
  { topic: "Mixed Problems & Final Sprint", title: "Word Search II", difficulty: "HARD", url: "https://leetcode.com/problems/word-search-ii/" },
  { topic: "Mixed Problems & Final Sprint", title: "LRU Cache", difficulty: "MEDIUM", url: "https://leetcode.com/problems/lru-cache/" },
  { topic: "Mixed Problems & Final Sprint", title: "Edit Distance", difficulty: "HARD", url: "https://leetcode.com/problems/edit-distance/" },
  { topic: "Mixed Problems & Final Sprint", title: "Alien Dictionary", difficulty: "HARD", url: "https://leetcode.com/problems/alien-dictionary/" },
];

async function main() {
  console.log("Seeding pristine CODE100 database (Clean State)...");

  // 1. Event Settings (Starts on Day 1)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(today.getTime() + 100 * 24 * 60 * 60 * 1000);

  await prisma.eventSetting.upsert({
    where: { id: "global" },
    create: {
      id: "global",
      eventName: "CODE100 — 100 Days of DSA",
      eventTagline: "100 Days. 100 Problems. One Streak.",
      organizationName: "GAT ACM Student Chapter",
      startDate: today,
      endDate,
      currentDayOverride: 1, // Fresh Day 1 start
      registrationOpen: true,
      allowedEmailDomains: "*",
      easyPoints: 10,
      mediumPoints: 15,
      hardPoints: 20,
      defaultRecoveryTokens: 3,
      certificateThresholdProblems: 80,
    },
    update: {
      startDate: today,
      endDate,
      currentDayOverride: 1,
      allowedEmailDomains: "*",
    },
  });

  // 2. Badges
  for (const b of DEFAULT_BADGES) {
    await prisma.badge.upsert({
      where: { slug: b.slug },
      create: b,
      update: b,
    });
  }
  console.log("✓ Seeded badges");

  // 3. ONLY 3 Core Accounts: Super Admin, Admin, and 1 Demo Student
  const passwordHash = await bcrypt.hash("acm@gat2026", 10);

  // Super Admin (Faculty Head - No student USN/Year/Branch needed)
  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@gat.ac.in" },
    create: {
      email: "superadmin@gat.ac.in",
      passwordHash,
      name: "Faculty Head (Super Admin)",
      role: "SUPER_ADMIN",
    },
    update: {
      passwordHash,
      status: "ACTIVE",
      branch: null,
      year: null,
      studentId: null,
      codingPlatform: null,
      platformUsername: null,
    },
  });

  // Admin (Chapter Moderator - No student USN/Year needed)
  const admin = await prisma.user.upsert({
    where: { email: "admin@gat.ac.in" },
    create: {
      email: "admin@gat.ac.in",
      passwordHash,
      name: "GAT ACM Admin",
      role: "ADMIN",
    },
    update: {
      passwordHash,
      status: "ACTIVE",
      branch: null,
      year: null,
      studentId: null,
      codingPlatform: null,
      platformUsername: null,
    },
  });

  // 1 Demo Student
  const demoStudent = await prisma.user.upsert({
    where: { email: "student@gat.ac.in" },
    create: {
      email: "student@gat.ac.in",
      passwordHash,
      name: "Rahul Sharma",
      role: "PARTICIPANT",
      branch: "CSE",
      year: 3,
      studentId: "1GA22CS089",
      codingPlatform: "leetcode",
      platformUsername: "rahul_codes",
      recoveryTokens: 3,
    },
    update: {
      passwordHash,
      status: "ACTIVE",
    },
  });

  // Initial student streak
  await prisma.streak.upsert({
    where: { userId: demoStudent.id },
    create: {
      userId: demoStudent.id,
      currentStreak: 0,
      longestStreak: 0,
      lastCompletedDate: null,
    },
    update: {
      currentStreak: 0,
      longestStreak: 0,
      lastCompletedDate: null,
    },
  });

  console.log("✓ Seeded ONLY 3 accounts: Super Admin, Admin, and 1 Participant");

  // 4. Seed 100 Challenges
  for (let i = 0; i < 100; i++) {
    const day = i + 1;
    const template = DSA_CURRICULUM[i] || {
      topic: "Algorithms",
      title: `DSA Challenge Day ${day}`,
      difficulty: "MEDIUM",
      url: "https://leetcode.com/problemset/all/",
    };

    const points = template.difficulty === "EASY" ? 10 : template.difficulty === "HARD" ? 20 : 15;
    const challengeDate = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
    const deadline = new Date(challengeDate.getTime() + 24 * 60 * 60 * 1000 - 1000);

    const slug = `day-${day}-${template.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

    await prisma.challenge.upsert({
      where: { dayNumber: day },
      create: {
        dayNumber: day,
        title: template.title,
        slug,
        topic: template.topic,
        difficulty: template.difficulty,
        platform: "LeetCode",
        externalUrl: template.url,
        points,
        startDate: challengeDate,
        deadline,
        description: `Solve "${template.title}" on LeetCode. Focus on optimal time and space complexity. Analyze edge cases thoroughly before writing code.`,
        constraints: "Standard LeetCode constraints apply. Ensure O(N) or O(N log N) where applicable.",
        examples: "Input: sample input\nOutput: expected output\nExplanation: Optimal approach.",
        hint: "Think about the algorithmic invariant or sorting beforehand to simplify lookup.",
        editorial: "Optimal approach uses linear or logarithmic time complexity.",
        status: day === 1 ? "ACTIVE" : "SCHEDULED",
      },
      update: {
        title: template.title,
        topic: template.topic,
        difficulty: template.difficulty,
        externalUrl: template.url,
        points,
        startDate: challengeDate,
        deadline,
        status: day === 1 ? "ACTIVE" : "SCHEDULED",
      },
    });
  }
  console.log("✓ Seeded all 100 official challenges (Day 1 Active, Days 2-100 Scheduled)");

  // 5. Initial Announcements
  await prisma.announcement.deleteMany({});
  await prisma.announcement.createMany({
    data: [
      {
        title: "Welcome to CODE100! 🚀",
        content: "100 Days. 100 Problems. One Streak. Organized by GAT ACM Student Chapter. Day 1 is now live!",
        type: "CHALLENGE",
        pinned: true,
        createdBy: admin.id,
      },
      {
        title: "Official Rules & Tie-Breaker Guidelines",
        content: "Make sure to review the official rules page. Solve daily challenges before 11:59 PM to preserve your streak.",
        type: "IMPORTANT",
        pinned: false,
        createdBy: admin.id,
      },
    ],
  });

  // 6. Clean Leaderboard Snapshot
  await prisma.leaderboardSnapshot.deleteMany({});
  await prisma.leaderboardSnapshot.create({
    data: {
      userId: demoStudent.id,
      name: demoStudent.name,
      branch: demoStudent.branch,
      year: demoStudent.year,
      points: 0,
      solvedCount: 0,
      currentStreak: 0,
      longestStreak: 0,
      consistencyScore: 0,
      rank: 1,
    },
  });

  console.log("✓ Clean initial leaderboard created.");
  console.log("All extra test data removed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
