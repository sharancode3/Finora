from abc import ABC, abstractmethod
from typing import List, Dict, Optional
from pydantic import BaseModel
import csv
import io
import requests

class ConnectorStatus(BaseModel):
    id: str
    name: str
    status: str
    error: Optional[str] = None

class ConnectionResult(BaseModel):
    success: bool
    error: Optional[str] = None

class DataSource(ABC):
    @abstractmethod
    def connect(self, credentials: dict) -> ConnectionResult: ...
    @abstractmethod
    def fetch_transactions(self, date_range: tuple) -> List[dict]: ...
    @abstractmethod
    def get_status(self) -> ConnectorStatus: ...


class CSVUploadConnector(DataSource):
    def __init__(self):
        self.connected = False
        self.records = []
        
    def connect(self, credentials: dict) -> ConnectionResult:
        # For CSV, the "credentials" could be the file content itself
        file_content = credentials.get("file_content", "")
        try:
            import pandas as pd
            # Use pandas to parse the CSV
            df = pd.read_csv(io.StringIO(file_content))
            self.records = df.to_dict(orient='records')
            self.connected = True
            return ConnectionResult(success=True)
        except Exception as e:
            self.connected = False
            return ConnectionResult(success=False, error=str(e))
            
    def fetch_transactions(self, date_range: tuple) -> List[dict]:
        return self.records
        
    def get_status(self) -> ConnectorStatus:
        return ConnectorStatus(
            id="csv_upload",
            name="CSV Upload",
            status="connected" if self.connected else "waiting_for_upload"
        )


class RazorpayTestModeConnector(DataSource):
    def __init__(self):
        self.connected = False
        self.api_key = None
        self.error_msg = None
        
    def connect(self, credentials: dict) -> ConnectionResult:
        api_key = credentials.get("api_key", "")
        if not api_key.startswith("rzp_test_"):
            self.connected = False
            self.error_msg = "Invalid key format. Must start with rzp_test_"
            return ConnectionResult(success=False, error=self.error_msg)
            
        try:
            auth = (api_key, "") if ":" not in api_key else tuple(api_key.split(":", 1))
            res = requests.get('https://api.razorpay.com/v1/payments', auth=auth, timeout=5)
            if res.status_code == 200:
                self.connected = True
                self.api_key = api_key
                self.error_msg = None
                return ConnectionResult(success=True)
            else:
                self.connected = False
                self.error_msg = f"Auth Failed: {res.status_code} {res.text}"
                return ConnectionResult(success=False, error=self.error_msg)
        except Exception as e:
            self.connected = False
            self.error_msg = str(e)
            return ConnectionResult(success=False, error=self.error_msg)

    def fetch_transactions(self, date_range: tuple) -> List[dict]:
        if not self.connected:
            raise RuntimeError("Not connected to Razorpay")
        # In a real app we would call the API. Here we just return empty list as mock.
        return []

    def get_status(self) -> ConnectorStatus:
        return ConnectorStatus(
            id="rzp_test",
            name="Razorpay (Test Mode)",
            status="connected" if self.connected else "disconnected",
            error=self.error_msg
        )


class UPIConnector(DataSource):
    def connect(self, credentials: dict) -> ConnectionResult:
        raise NotImplementedError("UPI Direct requires RBI NPCI integration — out of scope for buildathon")
    def fetch_transactions(self, date_range: tuple) -> List[dict]:
        raise NotImplementedError("UPI Direct requires RBI NPCI integration — out of scope for buildathon")
    def get_status(self) -> ConnectorStatus:
        return ConnectorStatus(id="upi", name="UPI Direct", status="unavailable", error="Requires RBI NPCI integration")


class BankAAConnector(DataSource):
    def connect(self, credentials: dict) -> ConnectionResult:
        raise NotImplementedError("Account Aggregator integration requires RBI licensing — out of scope for buildathon")
    def fetch_transactions(self, date_range: tuple) -> List[dict]:
        raise NotImplementedError("Account Aggregator integration requires RBI licensing — out of scope for buildathon")
    def get_status(self) -> ConnectorStatus:
        return ConnectorStatus(id="bank_aa", name="Bank Account Aggregator", status="unavailable", error="Requires RBI licensing")

# Global instances for the API to use
active_connectors = {
    "csv": CSVUploadConnector(),
    "rzp_test": RazorpayTestModeConnector(),
    "upi": UPIConnector(),
    "bank_aa": BankAAConnector()
}
