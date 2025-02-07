import React from "react";

const page = async (props: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ [key: string]: string | undefined | string[] }>;
}) => {
  const { prompt } = await props.searchParams;
  return <div>page</div>;
};

export default page;
