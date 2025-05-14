# Sinai Climbing App
This is an interface to the database of all climbing routes in Egypt, especially those in the Sinai but possibly in the future also for the rest of Egypt, once significant crags get opened
## Public Features (The 3 visible Tabs)
* Browse all areas
* Routes and their Topos (Only those routes visible that are linked to topos)
* A Map view to navigate
## Auth
Handled with Supabase JWT Session tokens on the Express.js backend.
### Auth Features
* Adding routes to an existing crag
* Adding Topo pictures to an existing crag
* Associating routes to Topos with their corresponding Topo number shown in the picture
* Updating the number of a Route which is already associated to a certain Topo
