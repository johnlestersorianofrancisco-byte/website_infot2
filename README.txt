INFOT 2 - BLACK + BLUE CREATIVE LOGIN WEBSITE
================================================

Created for John Lester Francisco.

FILES
-----
login.html
login_style.css
script.js       (login / register logic)
site.js         (shared navigation, page flow, login check)
index.html
skills.html
goals.html
funfacts.html
gallery.html
contact.html
style.css
IMAGES/

HOW TO USE
----------
1. Extract the ZIP.
2. Open login.html.
3. Use the demo account:
   Username: john@example.com
   Password: 123456
4. Or choose Register and create your own account.
5. After login, the website opens.

LOGIN DESIGN
------------
The login page is inspired by the uploaded reference video:
- dark background
- large "Creative Login Form" heading
- bright blue presentation area
- animated character-style illustration made with CSS
- browser/code window
- modern login/register card
- blue/cyan controls
- lime accent text
- responsive layout

NOTE
----
This uses localStorage for a school/demo project. It is NOT secure authentication
for a real production website.

NAVIGATION AND PAGE FLOW (site.js)
----------------------------------
- Name on the left, links on the right, built once and shared by every page.
- To add or rename a page, edit the PAGES list at the top of site.js.
- To open pages without logging in, set REQUIRE_LOGIN to false in site.js.
- About dropdown on desktop; hamburger menu with About accordion on mobile.
- Pages slide forward or backward depending on their order in PAGES.
- Previous / Next links at the bottom of each page.
