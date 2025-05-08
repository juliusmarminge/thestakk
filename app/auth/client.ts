import { queryOptions } from "@tanstack/react-query";

export const sessionQuery = queryOptions({
  queryKey: ["session"],
  queryFn: async () => {
    await new Promise((resolve) => setTimeout(resolve, 250)); // data loading
    return {
      session: {
        id: "",
        token: "",
      },
      user: {
        id: "",
        name: "",
        email: "",
        image: "",
      },
    };
  },
});
