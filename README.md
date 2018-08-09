# TurquoiseTuesday
```                                                                                                                          


    ______)                              ______)                    
   (, /                     ,           (, /               /)       
     /      __  _       ___   _    _      /       _  _   _(/ _      
  ) /  (_(_/ (_(_/_(_(_(_)_(_/_)__(/_  ) /  (_(__(/_/_)_(_(_(_(_(_/_
 (_/            /(                    (_/                      .-/  
               (_)                                            (_/   


```
WEBTASK Slack app for logging and reminding retro items


Setup service
------------------
Log into [WEBTASK](https://webtask.io/) and create a new project.

1. Copy-paste content of turquoiseTuesday.js into the project.
2. Make sure you have following npm modules set up:
    * body-parser@1.18.2
    * express@4.16.2
    * webtask-tools@3.2.0
    * mongodb@3.0.0-rc0
3. Add your mongoDB as a secret `MONGO_URL` parameter

NB! I used [mLab](https://mlab.com/) as a free cloud mongoDB service which was super easy and quick to set up.
Database name is set as `turquoise` and collection is named `my-collection`, but you can change them in code if required.

Setup Slack
------------------
Create a slack app

1. Under Features -> Slash Commands, create two new commands:
    * /feeling (As URL use `https://URL_THAT_WEBTASK_GAVE_YOU/feeling`)
    * /retro (As URL use `https://URL_THAT_WEBTASK_GAVE_YOU/retro`)
2. Under Features -> Interactive Components, enable Interactivity and set up request URL:
    * `https://URL_THAT_WEBTASK_GAVE_YOU/actions`
3. Make sure you install the app at your workplace

Usage
------------------

For setting a new reminder, use `/feeling` command  
* For positive action item: `/feeling +Release was smooth and successfull`  
* For negative action item: `/feeling -Difficult managing scope changes`  
* For general action item: `/feeling Should go to stripclub as our next team event`  
    
Too see your action items, use `/retro` command  