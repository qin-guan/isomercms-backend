import path from "path"

import { config } from "@config/config"

export enum JobStatus {
  Ready = "READY", // Ready to run jobs
  Running = "RUNNING", // A job is running
  Failed = "FAILED", // A job has failed and recovery is needed
}

export enum SiteStatus {
  Empty = "EMPTY", // A site record site is being initialized
  Initialized = "INITIALIZED",
  Launched = "LAUNCHED",
}

export enum RedirectionTypes {
  CNAME = "CNAME",
  A = "A",
}

export enum CollaboratorRoles {
  Admin = "ADMIN",
  Contributor = "CONTRIBUTOR",
  IsomerAdmin = "ISOMERADMIN",
}

export type CollaboratorRolesWithoutIsomerAdmin = Exclude<
  CollaboratorRoles,
  CollaboratorRoles.IsomerAdmin
>

export enum ReviewRequestStatus {
  Approved = "APPROVED",
  Open = "OPEN",
  Merged = "MERGED",
  Closed = "CLOSED",
}

export const E2E_ISOMER_ID = "-1"
export const E2E_TEST_EMAIL = "test@e2e"
export const E2E_TEST_CONTACT = "12345678"

export const GH_MAX_REPO_COUNT = 100
export const ISOMER_GITHUB_ORG_NAME = config.get("github.orgName")
export const ISOMER_ADMIN_REPOS = [
  "isomercms-backend",
  "isomercms-frontend",
  "isomer-redirection",
  "isomer-indirection",
  "isomerpages-template",
  "isomer-conversion-scripts",
  "isomer-wysiwyg",
  "isomer-slackbot",
  "isomer-tooling",
  "generate-site",
  "travisci-scripts",
  "recommender-train",
  "editor",
  "ci-test",
  "infra",
  "markdown-helper",
  "isomer-site-checker",
]
export const ISOMER_E2E_TEST_REPOS = [
  "e2e-test-repo",
  "e2e-email-test-repo",
  "e2e-notggs-test-repo",
]

export const INACTIVE_USER_THRESHOLD_DAYS = 60
export const GITHUB_ORG_REPOS_ENDPOINT = `https://api.github.com/orgs/${ISOMER_GITHUB_ORG_NAME}/repos`

export const REDIRECTION_SERVER_IPS = [
  "18.136.36.203",
  "18.138.108.8",
  "18.139.47.66",
]
export const DNS_INDIRECTION_DOMAIN = "hostedon.isomer.gov.sg"
export const DNS_INDIRECTION_REPO = "isomer-indirection"
export const ISOMER_ADMIN_EMAIL = "admin@isomer.gov.sg"
export const ISOMER_SUPPORT_EMAIL = "support@isomer.gov.sg"

export const MAX_CONCURRENT_GIT_PROCESSES = 150

export const EFS_VOL_PATH_STAGING = path.join(
  config.get("aws.efs.volPath"),
  "repos"
)
export const EFS_VOL_PATH_STAGING_LITE = path.join(
  config.get("aws.efs.volPath"),
  "repos-lite"
)
export const EFS_VOL_PATH_AUDIT_LOGS = path.join(
  config.get("aws.efs.volPath"),
  "audit-logs"
)
export const STAGING_BRANCH = "staging"
export const STAGING_LITE_BRANCH = "staging-lite"
export const PLACEHOLDER_FILE_NAME = ".keep"
export const GIT_SYSTEM_DIRECTORY = ".git"

// Homepage blocks limits
export const MAX_HERO_KEY_HIGHLIGHTS = 4
export const MAX_ANNOUNCEMENT_ITEMS = 5
export const MAX_TEXTCARDS_CARDS = 4
export const MAX_INFOCOLS_BOXES = 4
