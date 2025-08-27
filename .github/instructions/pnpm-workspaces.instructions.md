# PNPM Monorepo Setup for AI Agents 🤖

This guide provides a quick and easy way to set up and develop a monorepo using pnpm workspaces. It avoids specific technology choices and naming conventions, making it adaptable for various projects.

---

## 1\. Initial Setup

### Create Project and Initialize

Begin by creating a new directory and initializing it.

```bash
mkdir my-monorepo
cd my-monorepo
pnpm init
git init
```

### Configure Workspace

Create a `pnpm-workspace.yaml` file in the root directory and define the package locations.

**pnpm-workspace.yaml**

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### Create Directories

Create the `apps` and `packages` folders to house your projects.

```bash
mkdir -p apps packages
```

---

## 2\. Creating Projects

### Apps

Create your application projects inside the `apps` directory.

```bash
# Example: Create an app named 'web-app'
mkdir apps/web-app
cd apps/web-app
pnpm init
```

### Packages

Create reusable packages (e.g., UI components, shared utilities) inside the `packages` directory.

```bash
# Create a new package named 'shared-utils'
mkdir packages/shared-utils
cd packages/shared-utils
pnpm init
```

In the `packages/shared-utils/package.json` file, set `"private": true` to prevent accidental publishing.

---

## 3\. Linking and Using Packages

### Add a Shared Package

To use a package from the monorepo in an app, add it as a workspace dependency.

```bash
pnpm add shared-utils --filter web-app --workspace
```

This command adds the `shared-utils` package as a dependency to the `web-app`. The `package.json` for the `web-app` will now have `"shared-utils": "workspace:*"`.

### Build a Package

Build your reusable packages before using them.

```bash
pnpm --filter shared-utils build
```

---

## 4\. Root Scripts

For convenience, add scripts to the root `package.json` to run commands across all or specific projects.

**package.json** (root)

```json
"scripts": {
  "dev": "pnpm --parallel --filter \"./apps/*\" dev",
  "build": "pnpm --filter \"./apps/*\" build",
  "lint": "pnpm --parallel --filter \"./*\" lint"
}
```

- **`pnpm --parallel`**: Runs the command on all filtered projects in parallel.
- **`pnpm --filter`**: Specifies which projects the command should run on.
