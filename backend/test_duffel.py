import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.tickets.flight_aggregator import FlightAggregator

if __name__ == "__main__":
    try:
        aggregator = FlightAggregator()
        results = aggregator.search(
            origin="DEL",
            destination="DOH",
            departure_date="2026-11-15",
            passengers=1,
        )
        print("Duffel API Results:")
        print(results)
    except RuntimeError as e:
        print(f"\n[Configuration Notice]: {e}")
        print("To fetch live results from Duffel, please add your token to backend/.env:")
        print("DUFFEL_ACCESS_TOKEN=duffel_test_...\n")
    except Exception as e:
        print(f"Error during search: {e}")
