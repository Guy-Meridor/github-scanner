import pLimit from "p-limit";

const MAX_CONCURENT_REPO_SCANS = 3;
export const repoScanLimiter = pLimit(MAX_CONCURENT_REPO_SCANS);