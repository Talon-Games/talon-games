type Route = {
  name: string;
  path: string;
  signedIn: boolean;
  signedOut: boolean;
};

const routes: Route[] = [
  {
    name: "Home",
    path: "/",
    signedIn: true,
    signedOut: true,
  },
];

export default routes;
