const fs = require('fs');
const { execSync } = require('child_process');

// Read teams.json and members.json
const teamsData = JSON.parse(fs.readFileSync('teams.json', 'utf8'));
const membersData = JSON.parse(fs.readFileSync('members.json', 'utf8'));

// Create an object to hold team members
const teamMembers = {};

// Initialize team members object
teamsData.forEach(team => {
    teamMembers[team.name] = [];
});

// Populate team members
membersData.forEach(member => {
    const login = member.login;
    const avatarUrl = member.avatar_url;

    const userTeamsResponse = execSync(`curl -H "Authorization: token ${process.env.GITHUB_TOKEN}" "https://api.github.com/orgs/CompPsyUnion/members/${login}/teams"`);
    const userTeams = JSON.parse(userTeamsResponse);

    userTeams.forEach(team => {
        const teamName = team.name;
        teamMembers[teamName].push(`${login}|<img height='48' width='48' src='${avatarUrl}'>|`);
    });
});

// Generate the members.md file
let content = "# Organization Members\n";

for (const team in teamMembers) {
    content += `## ${team}\n`;
    content += "|:construction_worker:|:construction_worker:|:construction_worker:|:construction_worker:|:construction_worker:|:construction_worker:|\n`;
    content += "|:-------------------:|:-------------------:|:-------------------:|:-------------------:|:-------------------:|:-------------------:|\n";

    // Generate rows for members
    const membersRow = teamMembers[team].join('');
    for (let i = 0; i < membersRow.length; i += 6) {
        content += membersRow.slice(i, i + 6) + '\n';
    }
}

// Write to members.md
fs.writeFileSync('members.md', content);
