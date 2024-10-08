const fs = require('fs');
const { execSync } = require('child_process');

// 读取 teams.json 和 members.json 文件
const teamsData = JSON.parse(fs.readFileSync('teams.json', 'utf8'));
const membersData = JSON.parse(fs.readFileSync('members.json', 'utf8'));

// 创建一个对象来存储团队成员
const teamMembers = {};

// 初始化团队成员对象
teamsData.forEach(team => {
    teamMembers[team.name] = [];
});

// 填充团队成员
membersData.forEach(member => {
    const login = member.login;
    const avatarUrl = member.avatar_url;

    try {
        const userTeamsResponse = execSync(`curl -s -H "Authorization: token ${process.env.PAT_TOKEN}" "https://api.github.com/orgs/CompPsyUnion/members/${login}/teams"`);
        const userTeams = JSON.parse(userTeamsResponse);

        // 确保 userTeams 是数组，然后处理
        if (Array.isArray(userTeams)) {
            userTeams.forEach(team => {
                const teamName = team.name;
                // 生成头像和昵称格式
                teamMembers[teamName].push(`${login}|<img height='48' width='48' src='${avatarUrl}'>|`);
            });
        } else {
            console.error(`Expected an array but got: ${JSON.stringify(userTeams)}`);
        }
    } catch (error) {
        console.error(`Error fetching teams for ${login}: ${error.message}`);
    }
});

// 生成 members.md 文件内容
let content = "# Organization Members\n";

for (const team in teamMembers) {
    content += `## ${team}\n`;

    const membersList = teamMembers[team];
    const rows = Math.ceil(membersList.length / 6); // 计算所需的行数

    // 添加表格标题行
    content += "|:construction_worker:|:construction_worker:|:construction_worker:|:construction_worker:|:construction_worker:|:construction_worker:|\n";
    content += "|:-------------------:|:-------------------:|:-------------------:|:-------------------:|:-------------------:|:-------------------:|\n";

    for (let i = 0; i < rows; i++) {
        content += "|"; // 开始新行
        for (let j = 0; j < 6; j++) { // 每行最多 6 个成员
            const memberIndex = i * 6 + j;
            if (memberIndex < membersList.length) {
                content += membersList[memberIndex];
            } else {
                content += "|"; // 如果没有成员则留空
            }
        }
        content += "\n"; // 行结束
    }
}

// 写入 members.md 文件
fs.writeFileSync('members.md', content);
