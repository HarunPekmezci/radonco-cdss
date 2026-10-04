import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    // Worktree checkout: lockfile lives in parent; tell Turbopack the real root
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
