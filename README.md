# Description
Integrate your chatbot with Todoist to create and modify tasks, manage projects, and more.

# Installation and configuration

Follow these steps to set up Todoist integration for your Botpress bot:

1. **Todoist App creation**
    - Create an app in the [App Management page](https://developer.todoist.com/appconsole.html)
    - Copy your user's API token or generate a test token in the App Management page of your app
2. **Todoist Botpress integration configuration**
    - Install the Todoist integration in your Botpress bot
    - Paste the API token copied earlier in the configuration fields. This is the token your bot will use to post comments, update or create tasks, etc
    - Save configuration
    - Copy the Webhook URL of your bot
3. **Todoist App Webhook configuration**
    - Go in the App Management page of your app on Todoist
    - Make sure the Webhooks events are activated if the App is used with your personnal account. Follow [these instructions](https://developer.todoist.com/sync/v9/#webhooks)
    - Paste the Webhook URL copied earlier in the *Webhook callback URL* field
    - Check the following *Watched Events*:
        - *item:added*
        - *item:updated*
        - *item:completed*
        - *note:added*
    - Save the Webhook configuration
