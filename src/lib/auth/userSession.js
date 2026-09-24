"use client";

// Clean Data Access & Session Boundary for SkillBridge AI
// Isolates local storage prototype persistence for seamless MongoDB integration (MONGODB_URI)

export function getStoredUser() {
  if (typeof window === "undefined") return null;
  try {
    const item = localStorage.getItem("innoverse_user");
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
}

export function saveStoredUser(userObj) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("innoverse_user", JSON.stringify(userObj));
  } catch (e) {
    console.error("Error storing session:", e);
  }
}

export function clearStoredUser() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("innoverse_user");
    localStorage.removeItem("innoverse_company");
  } catch (e) {
    console.error("Error clearing session:", e);
  }
}

export function isAuthenticated() {
  return !!getStoredUser();
}

export function getUserRole() {
  const user = getStoredUser();
  return user?.role || null;
}

export function getRoleDestinationPath(role) {
  switch (role) {
    case "industry":
      return "/industry";
    case "workforce":
      return "/workforce";
    case "student":
    default:
      return "/student";
  }
}

export function handleLensNavigation(targetRole, router) {
  const user = getStoredUser();
  if (!user) {
    // Unauthenticated: Route to Get Started / Auth flow with preselected role
    router.push(`/get-started?role=${targetRole}`);
    return;
  }

  // Authenticated user check
  const userRole = user.role || "student";
  if (userRole === targetRole) {
    router.push(getRoleDestinationPath(targetRole));
  } else {
    // Role conflict: Route to Get Started / Auth flow with conflict context
    router.push(`/get-started?role=${targetRole}&conflict=true&currentRole=${userRole}`);
  }
}
