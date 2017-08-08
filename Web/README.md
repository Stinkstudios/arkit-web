# Web

The WebGL content for rendering the AR scene.

The setup is fairly minimal to allow you the developer to use your prefered WebGL authoring approach.

## Tasks

* `yarn start` - Start the dev server. *Note `.env` needs to be created first*
* `yarn tunnel` - Start an ngrok connection for live development

Check package.json for the rest

## Running

Once you've ran `yarn tunnel` copy the `https` url from your terminal console and update `DEV_URL` in `ViewController.swift`

## Debugging

Use the Safari Technology Preview inspector to view the console logs.
