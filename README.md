# sms-library-helper
[![Travis](https://img.shields.io/travis/Holi0317/sms-library-helper.svg?style=flat-square)](https://travis-ci.org/Holi0317/sms-library-helper)

Library helper for St. Mark's School.

## Brief introduction
Well, this tool will help user to auto-renew book and add due date to Google calendar. That's it.

## Deployed site
[Here](https://slh.holi0317.net/)

## Contribution guide
1. All code must pass eslint. However, there is no lint job in gulp. So you need to lint it yourself.
2. If you can, write some tests.
3. Write precise documentation. Because I am stupid and forgets things I have done 3 months ago.

## License
This project is released under MIT License.

## Deploy
 - Checkout nginx-example.conf for nginx example.
 - Use pm2 for deployment.
 - Copy `config.template.js` to `config.js` and edit it by those comments.
