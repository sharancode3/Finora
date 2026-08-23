import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from data.generate_data import run

if __name__ == "__main__":
    run()
