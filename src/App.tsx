import { Route, Routes } from 'react-router-dom'
import { Home } from './screens/Home'
import { ComingSoon } from './screens/ComingSoon'
import { ArithmeticPlay } from './modes/arithmetic/ArithmeticPlay'
import { OptiverPlay } from './modes/optiver80/OptiverPlay'
import { PercentPlay } from './modes/percent/PercentPlay'
import { MultiplicationPlay } from './modes/multiplication/MultiplicationPlay'
import { FermiPlay } from './modes/fermi/FermiPlay'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/stats" element={<ComingSoon title="Stats" />} />
      <Route path="/settings" element={<ComingSoon title="Settings" />} />
      <Route path="/play/arithmetic" element={<ArithmeticPlay />} />
      <Route path="/play/optiver80" element={<OptiverPlay />} />
      <Route path="/play/percent" element={<PercentPlay />} />
      <Route path="/play/multiplication" element={<MultiplicationPlay />} />
      <Route path="/play/fermi" element={<FermiPlay />} />
      <Route path="/play/sequence" element={<ComingSoon title="Sequence & Pattern" />} />
      <Route path="/play/ev-market" element={<ComingSoon title="EV Card Market" />} />
      <Route path="/play/etf-arb" element={<ComingSoon title="ETF Arbitrage" />} />
    </Routes>
  )
}

export default App
