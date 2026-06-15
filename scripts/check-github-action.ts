import "dotenv/config";

async function main() {
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  if (!token) {
    console.error("No GitHub token found in env.");
    return;
  }

  const repo = "asiaunion/GSF-Blog";
  const url = `https://api.github.com/repos/${repo}/actions/runs?per_page=1`;

  const res = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/vnd.github.v3+json",
      "User-Agent": "Node-Fetch"
    }
  });

  if (!res.ok) {
    console.error("Failed to fetch:", res.status, await res.text());
    return;
  }

  const data = await res.json();
  const latestRun = data.workflow_runs[0];
  console.log(`Latest Run: ${latestRun.name} (#${latestRun.run_number})`);
  console.log(`Conclusion: ${latestRun.conclusion}`);
  console.log(`HTML URL: ${latestRun.html_url}`);
  console.log(`Jobs URL: ${latestRun.jobs_url}`);

  const jobsRes = await fetch(latestRun.jobs_url, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/vnd.github.v3+json",
      "User-Agent": "Node-Fetch"
    }
  });

  if (jobsRes.ok) {
    const jobsData = await jobsRes.json();
    for (const job of jobsData.jobs) {
      console.log(`Job: ${job.name} - ${job.conclusion}`);
      for (const step of job.steps) {
        if (step.conclusion === "failure") {
          console.log(`  -> FAILED STEP: ${step.name}`);
        }
      }
    }
  }
}

main().catch(console.error);
