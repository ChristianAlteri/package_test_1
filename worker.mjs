import axios from 'axios';

async function fetchGitHubRepos(username) {
  try {
    const response = await axios.get(`https://api.github.com/users/${username}/repos?per_page=100`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch GitHub repositories: ${error.message}`);
  }
}
async function fetchBiggestRepoData(username, biggestRepo) {
  try {
    const response = await axios.get(`https://api.github.com/repos/${username}/${biggestRepo}/languages`);
    // console.log('RESPONSE', response.data);
    return response
  } catch (error) {
    throw new Error(`Failed to fetch GitHub repositories: ${error.message}`);
  }
}

function calculateMostFrequentLanguages(data) {
  let [frequencies, highestFrequency, mostFrequentLangs] = [{}, 0, []];
  data.forEach(function (repo) {
    console.log('repo', repo);
    const lang = repo.language;
    if (lang === null) return;
    frequencies[lang] ? frequencies[lang]++ : (frequencies[lang] = 1);
    if (frequencies[lang] > highestFrequency) {
      highestFrequency = frequencies[lang];
      mostFrequentLangs = [lang];
    } else if (frequencies[lang] === highestFrequency) {
      mostFrequentLangs.push(lang);
    }
  });
  return determineMessage(mostFrequentLangs);
}

function calculateBiggestRepo(data) {
  let [biggestRepo, biggestSize] = [null, 0];

  data.forEach(function (repo) {
    if (repo.size > biggestSize) {
      biggestRepo = repo.name;
      biggestSize = repo.size;
    }
  });

  return { biggestRepo, biggestSize };
}

function determineMessage(mostFrequentLangs, biggestRepoData) {
  if (mostFrequentLangs.length === 0) {
    return "This user has no code";
  } else {
    const languagesMessage = `The most frequent languages are: ${mostFrequentLangs.join(", ")}`;
    const biggestRepoMessage = `The biggest repo is ${biggestRepoData}`;
    return `${languagesMessage} and ${biggestRepoMessage}`;
  }
}


async function fetchGitHubData(username) {
  try {
    // Fetch GitHub repositories
    const repos = await fetchGitHubRepos(username);

    // Calculate biggest repo
    const { biggestRepo, biggestSize } = calculateBiggestRepo(repos);

    // Fetch GitHub languages for the biggest repo
    const languages = await fetchBiggestRepoData(username, biggestRepo);

    // Calculate and print the result
    const message = calculateMostFrequentLanguages(repos);
    console.log(message);
    console.log("Biggest Repo:", biggestRepo);
    console.log("Biggest Size:", biggestSize);
  } catch (error) {
    console.error(error);
  }
}

// Example usage:
const username = 'ChristianAlteri';

// fetchGitHubRepos(username)
//   .then((data) => {
//     const { biggestRepo, biggestSize } = calculateBiggestRepo(data);
//     const message = calculateMostFrequentLanguages(data);
//     console.log(message);
//     console.log("Biggest Repo:", biggestRepo);
//     console.log("Biggest Size:", biggestSize);
//   })
//   .catch((error) => console.error(error));


fetchGitHubData(username)