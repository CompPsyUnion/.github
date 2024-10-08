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

    const userTeamsResponse = execSync(`curl -H "Authorization: token ${process.env.PAT_TOKEN}" "https://api.github.com/orgs/CompPsyUnion/members/${login}/teams"`);
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

    const membersList = teamMembers[team];
    const rows = Math.ceil(membersList.length / 6); // Calculate number of rows needed

    for (let i = 0; i < rows; i++) {
        content += "|"; // Start a new row
        for (let j = 0; j < 6; j++) { // Up to 6 members per row
            const memberIndex = i * 6 + j;
            if (memberIndex < membersList.length) {
                content += membersList[memberIndex];
            } else {
                content += "|"; // Empty cell for non-existing members
            }
        }
        content += "\n"; // End the row
    }

    // Add table headers for the current team
    content += "|:construction_worker:|:construction_worker:|:construction_worker:|:construction_worker:|:construction_worker:|:construction_worker:|\n";
    content += "|:-------------------:|:-------------------:|:-------------------:|:-------------------:|:-------------------:|:-------------------:|\n";
}

// Write to members.md
fs.writeFileSync('members.md', content);
