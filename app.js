  
/**
 * @param {import('probot').Probot} app
 */
 module.exports = (app) => {
    app.log("Yay! The app was loaded!");
  
    app.on("issues.opened", async (context) => {
      return context.octokit.issues.createComment(
        context.issue({ body: "Hello, World AWS Lambda!" })
      );
    });


    app.on(["check_suite.requested", "check_suite.rerequested"],  async (context) => {

        head_sha = context.payload.check_run ? context.payload.check_run.head_sha : context.payload.check_suite.head_sha;
        const params  = context.repo ({
          name: 'HC check workflows - lambda',
          head_sha:  head_sha
        })
        return context.octokit.checks.create(params);
     });

     app.on('check_run.created', async (context) => {
        const app_id = process.env.APP_ID
        app.log("app ID context: " + context.payload.check_run.app.id);
        app.log("app ID env: " + app_id);
       
        if (context.payload.check_run.app.id == app_id) { 
            app.log("YES update check ");
            const params_in_progress = context.repo ({
               name: 'HC check workflows - lambda',
               status: 'in_progress',
               started_at: new Date(),
               check_run_id:  context.payload.check_run.id
            })

            await context.octokit.checks.update(params_in_progress)

            await setTimeout(() => {  app.log("Timeout!"); }, 5000);

            const params_completed = context.repo({
                name: 'HC check workflows - lambda',
                status: 'completed',
                completed_at: new Date(),
                check_run_id:  context.payload.check_run.id,
                conclusion: 'success',
                output: {
                    title: 'check workflows',
                    summary: 'Dummy summary',
                    text: 'dummy text',
                }
            })

            await context.octokit.checks.update(params_completed)

        }else{
            app.log("Not update check ");
        }
     });

  };