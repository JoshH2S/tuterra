# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/a4fd97e6-a05f-4e81-a066-ebca85cf1496

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/a4fd97e6-a05f-4e81-a066-ebca85cf1496) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/a4fd97e6-a05f-4e81-a066-ebca85cf1496) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)

## AI Feedback System

The Virtual Internship Dashboard includes an automated AI feedback system for task submissions. When a student submits a task, the system automatically generates constructive feedback using OpenAI.

### How It Works

1. Student submits a task through the task details modal
2. The submission triggers an Edge Function called `generate-internship-feedback`
3. The Edge Function sends the submission text, task description, and relevant context to OpenAI
4. The AI-generated feedback is stored in the database and displayed to the student

### Setting Up the AI Feedback System

1. Deploy the Edge Function:
   ```bash
   # Make the script executable
   chmod +x deploy-edge-function.sh
   
   # Run the deployment script
   ./deploy-edge-function.sh
   ```

2. Make sure your Supabase project has the following environment variables:
   - `OPENAI_API_KEY`: Your OpenAI API key

3. The Edge Function requires the following Supabase tables:
   - `internship_sessions`: Stores internship session information
   - `internship_tasks`: Stores task information
   - `internship_task_submissions`: Stores task submissions and feedback

### Customizing the AI Feedback

You can customize the feedback generation by modifying the prompt in the Edge Function located at `supabase/functions/generate-internship-feedback/index.ts`.

The system provides structured feedback that includes:
- Strengths of the submission
- Areas for improvement
- Suggestions for next steps
- A final assessment

## Virtual Internship Dashboard

The Virtual Internship Dashboard provides students with a realistic internship experience. It includes:

### Messaging System

The dashboard includes a comprehensive messaging system that simulates communications in a real work environment:

- **Task-linked Messages**: Supervisor messages are linked to specific tasks with references displayed in the message preview
- **Team Member Messages**: Receive messages from simulated team members offering assistance and resources
- **Periodic Check-ins**: Regular supervisor check-ins to monitor progress
- **Unread Indicators**: Visual indicators for unread messages
- **Message Expansion**: Click on messages to view full content
- **Task References**: Messages referencing tasks include quick links to navigate to the specific task

### Task Management

Students can:
