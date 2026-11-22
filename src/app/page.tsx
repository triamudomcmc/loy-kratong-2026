import { Navbar } from "@components/Nav";
import { Story } from "@components/Story";
import { HomeRedirect } from "./home-redirect";

export default function Home() {
  return (
    <>
      <HomeRedirect />
      <Navbar />
      <Story />
    </>
  );
}
