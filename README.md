#jQuery-widget.tmpl.js

This JavaScript file is not a jQuery plugin in and of itself.
Instead, it's a starter file for widget development.
The advantage to a starter file over a plugin is that the starter file is completely self-encapsulating.
Any code changes that are needed can be performed within the code, and they wont leak into other plugins
(such as the conflicts between the jQuery UI and jQuery Mobile `$.widget` factory functions).