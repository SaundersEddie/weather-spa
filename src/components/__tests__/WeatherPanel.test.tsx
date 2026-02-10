import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WeatherPanel from '../WeatherPanel';

test('renders forecast after entering a ZIP', async () => {
  const user = userEvent.setup();
  render(<WeatherPanel title='Home' testId='panel-home' />);

  const zip = screen.getByLabelText('ZIP');
  await user.type(zip, '10001');
  await user.click(screen.getByRole('button', { name: /get weather/i }));

  // Location label from MSW handler
  expect(await screen.findByText(/Mock City/i)).toBeInTheDocument();

  // Sections should render once data is loaded
  expect(screen.getByText(/Next 24 Hours/i)).toBeInTheDocument();
  expect(screen.getByText(/7-Day/i)).toBeInTheDocument();
});

test('shows not found state for unknown ZIP', async () => {
  const user = userEvent.setup();
  render(<WeatherPanel title='Home' testId='panel-home' />);

  await user.type(screen.getByLabelText('ZIP'), '00000');
  await user.click(screen.getByRole('button', { name: /get weather/i }));

  const alert = await screen.findByRole('alert');
  expect(alert).toHaveTextContent(/No results for that ZIP/i);
});

test('validates ZIP format', async () => {
  const user = userEvent.setup();
  render(<WeatherPanel title='Home' testId='panel-home' />);

  await user.type(screen.getByLabelText('ZIP'), 'abc');
  await user.click(screen.getByRole('button', { name: /get weather/i }));

  const panel = screen.getByTestId('panel-home');
  const alert = await screen.findByRole('alert');
  expect(alert).toHaveTextContent(/5-digit ZIP/i);
  expect(panel).toContainElement(alert);
});
