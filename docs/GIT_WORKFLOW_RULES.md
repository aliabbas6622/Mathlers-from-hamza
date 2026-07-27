# Git Workflow & Version Control Rules

## Mandatory Rule: Always Pull Before Push

Whenever working on the repository or committing/pushing changes, follow this strict sequence:

1. **Check Status**:
   ```bash
   git status
   ```

2. **Stage and Commit Local Work**:
   ```bash
   git add .
   git commit -m "Your descriptive commit message"
   ```

3. **ALWAYS PULL FIRST**:
   ```bash
   git pull origin main --rebase=false
   ```
   *Verify there are no merge conflicts or resolve any conflict markers if present.*

4. **PUSH TO REMOTE**:
   ```bash
   git push origin main
   ```

---

### Important Guidelines
* **Never push uncommitted or unmerged code.**
* **Always verify local build and status after pulling remote updates.**
