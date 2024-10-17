import axios from 'axios';

async function fetchGitHubRepos(username) {
  try {
    const response = await axios.get(`https://api.github.com/users/${username}/repos?per_page=3`); // Fetch first 3 repos
    return response.data.map(repo => repo.name); // Return repo names
  } catch (error) {
    throw new Error(`Failed to fetch GitHub repositories: ${error.message}`);
  }
}

async function fetchGitHubRepoContents(username, repo) {
  try {
    const response = await axios.get(`https://api.github.com/repos/${username}/${repo}/contents/package.json`);
    const packageJson = JSON.parse(Buffer.from(response.data.content, 'base64').toString());
    return packageJson;
  } catch (error) {
    throw new Error(`Failed to fetch package.json from ${repo}: ${error.message}`);
  }
}

async function fetchLatestVersion(packageName) {
  try {
    const response = await axios.get(`https://registry.npmjs.org/${packageName}/latest`);
    return response.data.version;
  } catch (error) {
    throw new Error(`Failed to fetch latest version for ${packageName}: ${error.message}`);
  }
}

function calculateOutdatedDependencies(dependencies) {
  let outdatedDeps = [];

  Object.entries(dependencies).forEach(([pkg, currentVersion]) => {
    outdatedDeps.push({ pkg, currentVersion });
  });

  return outdatedDeps;
}

async function fetchOutdatedDependencies(username, repo) {
  try {
    // Fetch package.json from the repo
    const packageJson = await fetchGitHubRepoContents(username, repo);
    const dependencies = packageJson.dependencies;

    if (!dependencies) {
      console.log(`No dependencies found in repo: ${repo}`);
      return;
    }

    // Calculate outdated dependencies
    let outdatedDeps = calculateOutdatedDependencies(dependencies);

    // Check each dependency against the latest version
    for (let dep of outdatedDeps) {
      const latestVersion = await fetchLatestVersion(dep.pkg);
      const cleanedCurrentVersion = dep.currentVersion.replace(/[^\d.]/g, ''); // Remove non-numeric characters

      if (cleanedCurrentVersion !== latestVersion) {
        console.log(`Repo: ${repo} - Package ${dep.pkg} is outdated. Current: ${dep.currentVersion}, Latest: ${latestVersion}`);
      } else {
        console.log(`Repo: ${repo} - Package ${dep.pkg} is up to date.`);
      }
    }
  } catch (error) {
    console.error(error);
  }
}

async function fetchGitHubData(username) {
  try {
    // Fetch the first 3 GitHub repositories
    const repos = await fetchGitHubRepos(username);

    // Loop through the first 3 repositories and check dependencies
    for (const repo of repos) {
      console.log(`Checking repo: ${repo}`);
      await fetchOutdatedDependencies(username, repo);
    }
  } catch (error) {
    console.error(error);
  }
}

// Example usage:
const username = 'ChristianAlteri';
fetchGitHubData(username);
