function RoutesList() {
  const {currentUser, isLoading} = useAuth();
  const {currentDb} = useCurrentDb();

  if (isLoading) {
    return <div>Loading...</div>; // shows something instead of blank
  }

  // Define all routes
  const publicRoutes = (
    <>
      <Route path="/signin" element={<Signin />} />
      <Route path="/signup" element={<Signup />} />
    </>
  );

  const privateRoutes = (
    <>
      <Route path="/settings/account" element={<Account />} />
      <Route path="/:dbUrl/home" element={<Main />} />
      <Route path="/:dbUrl/contacts" element={<ContactList />} />
      <Route path="/:dbUrl/contacts/new" element={<Contact />} />
      <Route path="/:dbUrl/contacts/:id" element={<Contact />} />
      <Route path="/:dbUrl/users" element={<UsersList />} />
      <Route path="/:dbUrl/users/:id" element={<User />} />
      <Route path="/:dbUrl/properties" element={<PropertiesList />} />
      <Route path="/:dbUrl/properties/new" element={<Property />} />
      <Route path="/:dbUrl/properties/:id" element={<Property />} />
    </>
  );

  return (
    <Routes>
      {/* NEW: Explicit root route - fixes blank page and weird redirects */}
      <Route
        path="/"
        element={
          currentUser ? (
            currentDb?.url ? (
              <Navigate to={`/${currentDb.url}/home`} replace />
            ) : (
              <Navigate to="/settings/databases" replace />
            )
          ) : (
            <Navigate to="/signin" replace />
          )
        }
      />

      {/* Your existing routes */}
      {publicRoutes}
      {privateRoutes}

      {/* NEW: True 404 catcher - redirects instead of showing Railway 404 */}
      <Route
        path="*"
        element={
          currentUser ? (
            currentDb?.url ? (
              <Navigate to={`/${currentDb.url}/home`} replace />
            ) : (
              <Navigate to="/settings/databases" replace />
            )
          ) : (
            <Navigate to="/signin" replace />
          )
        }
      />
    </Routes>
  );
}
