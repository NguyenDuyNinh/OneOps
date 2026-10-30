import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [
      { source: "/home", destination: "/", permanent: false },
      {
        source: "/tasks",
        destination: "/work-management/tasks",
        permanent: false,
      },
      {
        source: "/projects",
        destination: "/work-management/projects",
        permanent: false,
      },
      {
        source: "/calendar",
        destination: "/work-management/calendar",
        permanent: false,
      },
      {
        source: "/requests",
        destination: "/work-management/tickets-approvals",
        permanent: false,
      },
      {
        source: "/messages",
        destination: "/work-management/internal-chat",
        permanent: false,
      },
      {
        source: "/notes",
        destination: "/work-management/knowledge-sop",
        permanent: false,
      },
      {
        source: "/reports",
        destination: "/work-management/reports",
        permanent: false,
      },
    ];
  },
};
export default nextConfig;
