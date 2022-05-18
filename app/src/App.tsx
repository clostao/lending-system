import { Header } from "./components/Header";
import { HomeCard } from "./components/HomeCard";
import { LendingBalances } from "./components/LendingBalances";
import { LendingPanel } from "./components/LendingPanel";
import { Middleframe } from "./components/Middleframe";

function App() {
  return (
    <div>
      <Header />
      <Middleframe>
        <HomeCard />
        <LendingBalances />
        <LendingPanel />
      </Middleframe>
    </div>
  );
}

export default App;
