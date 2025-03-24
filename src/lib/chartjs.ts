
import { Chart, registerables, CategoryScale } from 'chart.js';

// Register all the components we need
Chart.register(...registerables);

// Ensure CategoryScale is explicitly registered
Chart.register(CategoryScale);
