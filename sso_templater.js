import readline from 'readline';
import fs from 'fs'
import fetch from 'node-fetch'

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Prepare an object to collect user inputs
let userInput = {};

// Function to get user input
function ask(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

(async function main() {
    // Getting all the user inputs
    userInput.connectionName = await ask('Enter the connection name: ');
    userInput.connectionRoleField = await ask('Enter the connection\'s fieldname for the client\'s roles: ');
    userInput.roleFieldType = await ask('Enter the datatype of the role field (string, array, number): ');

    userInput.hasSiteID = await ask('Does the client send a site ID? (y/n): ');

    if (userInput.hasSiteID.toLowerCase() === 'y') {
        userInput.siteIDField = await ask('Enter the fieldname for the client\'s siteID: ');
        userInput.siteIDFieldType = await ask('Enter the datatype for the siteID field (string, array, number): ');
    }

    userInput.customCommands = await ask('Any custom commands or considerations? (Press enter if none): ');

    let templatePath = process.argv[2];
    // For now, we will just print out the path to the console. In a real-world scenario,
    // you'd read the template file's content and use it in the final prompt.
    console.log('Template Path:', templatePath);
    let templateContent;
    try {
        templateContent = fs.readFileSync(templatePath, 'utf-8');
    } catch (err) {
        console.error('Error reading the template:', err);
        rl.close();
        return;
    }

    // Prepare the OpenAI prompt using user input
    let openaiPrompt = `
Write a JS function for an Auth0 rule based off of the template provided. The function takes in a user payload and enriches a metadata object and token. If there are any custom commands or considerations,, include them. 
Connection Name: ${userInput.connectionName}
Role Field: ${userInput.connectionRoleField} (${userInput.roleFieldType})
${userInput.hasSiteID.toLowerCase() === 'y' ? `SiteID Field: ${userInput.siteIDField} (${userInput.siteIDFieldType})` : ''}
Custom Commands or Considerations: ${userInput.customCommands}
Template: ${templateContent}
    `;

    console.log('OpenAI Prompt:', openaiPrompt);
  // Call the OpenAI API with the prepared prompt using fetch
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer OPEN_AI_KEY',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                  "role": "system",
                  "content": "You are a javasctipt programmer. you only respond with code."
                },
                {
                  "role": "user",
                  "content": openaiPrompt
                }
              ]
        })
    });

    if (!response.ok) {
        throw new Error(`OpenAI API responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Save the response to a file
    fs.writeFileSync('response.js',data.choices[0].message.content);
    console.log('Saved response to response.js');

} catch (error) {
    console.error('Error calling OpenAI API:', error);
}
    rl.close();
})();
