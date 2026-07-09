import { Route, Routes } from 'react-router-dom'
import { Home } from './screens/Home'
import { ComingSoon } from './screens/ComingSoon'
import { ArithmeticPlay } from './modes/arithmetic/ArithmeticPlay'
import { OptiverPlay } from './modes/optiver80/OptiverPlay'
import { PercentPlay } from './modes/percent/PercentPlay'
import { MultiplicationPlay } from './modes/multiplication/MultiplicationPlay'
import { FermiPlay } from './modes/fermi/FermiPlay'
import { SequencePlay } from './modes/sequence/SequencePlay'
import { EvMarketPlay } from './modes/evMarket/EvMarketPlay'
import { Stats } from './screens/Stats'
import { Settings } from './screens/Settings'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/stats" element={<Stats />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/play/arithmetic" element={<ArithmeticPlay />} />
      <Route path="/play/optiver80" element={<OptiverPlay />} />
      <Route path="/play/percent" element={<PercentPlay />} />
      <Route path="/play/multiplication" element={<MultiplicationPlay />} />
      <Route path="/play/fermi" element={<FermiPlay />} />
      <Route path="/play/sequence" element={<SequencePlay />} />
      <Route path="/play/ev-market" element={<EvMarketPlay />} />
      <Route path="/play/etf-arb" element={<ComingSoon title="ETF Arbitrage" />} />
    </Routes>
  )
}

export default App
