import re

class VerificationResult:
    def __init__(self, passed: bool, failure_reason: str = None):
        self.passed = passed
        self.failure_reason = failure_reason

class Verifier:
    def check(self, draft_answer: str, tool_results: list) -> VerificationResult:
        # Extract all numeric/currency tokens from draft
        numbers_found = self.extract_numbers(draft_answer)
        # Extract all numbers from tool results
        numbers_allowed = self.extract_numbers_from_tools(tool_results)

        # Allow small numbers like 1, 2, 3 which might be list items, dates, etc.
        # But for stricter verification on money, we should check all
        
        # A common issue is dates. Let's strictly check everything for now.
        for num in numbers_found:
            # We allow basic integers 0-31 for dates, or basic small numbers
            if num <= 31 and num == int(num):
                continue
            if not self.number_traces_to_source(num, numbers_allowed):
                return VerificationResult(
                    passed=False,
                    failure_reason=f"Number {num} not found in tool results"
                )

        # Check for invented record IDs
        ids_found = self.extract_record_ids(draft_answer)
        ids_allowed = self.extract_ids_from_tools(tool_results)
        for rid in ids_found:
            if rid not in ids_allowed:
                return VerificationResult(
                    passed=False,
                    failure_reason=f"Record ID {rid} not found in tool results"
                )

        return VerificationResult(passed=True)

    def extract_numbers(self, text: str) -> list[float]:
        # Regex for ₹XX,XXX.XX, ₹X,XX,XXX, bare numbers, percentages
        pattern = r'₹[\d,]+\.?\d*|\d+\.?\d*%?'
        matches = re.findall(pattern, text)
        return [self.normalize_num(m) for m in matches]

    def normalize_num(self, num_str: str) -> float:
        clean_str = num_str.replace('₹', '').replace(',', '').replace('%', '')
        try:
            return float(clean_str)
        except ValueError:
            return 0.0

    def extract_numbers_from_tools(self, tool_results: list) -> list[float]:
        numbers = []
        def traverse(obj):
            if isinstance(obj, dict):
                for k, v in obj.items():
                    traverse(v)
            elif isinstance(obj, list):
                for item in obj:
                    traverse(item)
            elif isinstance(obj, (int, float)):
                numbers.append(float(obj))
            elif isinstance(obj, str):
                # Optionally parse strings that look like numbers in tool results
                try:
                    numbers.append(float(obj))
                except ValueError:
                    pass
        traverse(tool_results)
        return numbers

    def extract_record_ids(self, text: str) -> list[str]:
        # Typical ID format: PAY-XXXX, BIZ-XXX, ORD-XXXX, UUIDs
        # For simplicity, extract anything starting with PAY-, BIZ-, ORD-, batch_
        pattern = r'(PAY-\d+|BIZ-\d+|ORD-\d+|batch_\d+)'
        return re.findall(pattern, text)

    def extract_ids_from_tools(self, tool_results: list) -> list[str]:
        ids = []
        def traverse(obj):
            if isinstance(obj, dict):
                for k, v in obj.items():
                    if k in ["id", "payment_id", "business_id", "order_id", "batch_id", "record_id"] and isinstance(v, str):
                        ids.append(v)
                    traverse(v)
            elif isinstance(obj, list):
                for item in obj:
                    traverse(item)
            elif isinstance(obj, str):
                # some lists might just be strings
                pass
        traverse(tool_results)
        return ids

    def number_traces_to_source(self, num: float, sources: list[float], tolerance: float = 0.01) -> bool:
        if num == 0.0: return True # always allow 0
        return any(abs(num - s) <= tolerance for s in sources)
