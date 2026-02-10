import './App.css';
import WeatherPanel from './components/WeatherPanel';

export default function App() {
  return (
    <div className='app-shell'>
      <div className='container py-4'>
        <div className='d-flex align-items-end justify-content-between mb-3'>
          <div>
            <h1 className='h3 mb-1'>Weather Compare</h1>
            <div className='muted'>Home vs destination</div>
          </div>
          <div className='muted small'>Open-Meteo • no keys</div>
        </div>

        <div className='row g-3'>
          <div className='col-12 col-lg-6'>
            <WeatherPanel title='Home' testId='panel-home' />
          </div>
          <div className='col-12 col-lg-6'>
            <WeatherPanel title='Destination' testId='panel-destination' />
          </div>
        </div>
      </div>
    </div>
  );
}
