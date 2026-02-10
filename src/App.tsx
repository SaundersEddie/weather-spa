import './App.css';

export default function App() {
  return (
    <div className='app-shell'>
      <div className='container py-4'>
        <div className='d-flex align-items-end justify-content-between mb-3'>
          <div>
            <h1 className='h3 mb-1'>Weather Compare</h1>
            <div className='muted'>
              Home vs destination — because plans change.
            </div>
          </div>
          <div className='muted small'>Open-Meteo • no keys</div>
        </div>

        <div className='row g-3'>
          <div className='col-12 col-lg-6'>
            {/* <WeatherPanel title="Home" /> */}
            <div className='panel p-3'>Home panel placeholder</div>
          </div>
          <div className='col-12 col-lg-6'>
            {/* <WeatherPanel title="Destination" /> */}
            <div className='panel p-3'>Destination panel placeholder</div>
          </div>
        </div>
      </div>
    </div>
  );
}
