const getDrushim = async function (query, page = 1) {
  let _page = page - 2;
  const response = await fetch(
    `https://www.drushim.co.il/api/jobs/search?searchTerm=${query}&page=${_page}`
  );
  const data = await response.json();
  const jobsList = data.ResultList;

  const jobs = jobsList.map((j) => {
    const link = `https://www.drushim.co.il${j.JobInfo.Link}`;
    const id = "id-dr-" + j.JobAnalytics.id;
    const title = j.JobContent.Name;
    const description = j.JobContent.Description;
    const requirements = j.JobContent.Requirements;
    const publishTime = j.JobInfo.JumpDateString;
    const type = j.JobContent.Scopes.NameInHebrew;
    const location = [j.JobContent.Addresses[0].City];
    return {
      id,
      title,
      link,
      description,
      requirements,
      publishTime,
      type,
      location,
    };
  });

  return jobs;
};

module.exports = { getDrushim };
