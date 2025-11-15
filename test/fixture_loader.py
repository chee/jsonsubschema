'''
Fixture loader for jsonsubschema tests
Loads JSON test fixtures for both Python and JavaScript implementations
'''

import json
import os
from pathlib import Path
from typing import Dict, List, Any, Optional


class FixtureLoader:
    """Load JSON test fixtures from the fixtures directory"""

    def __init__(self, fixtures_dir: Optional[str] = None):
        if fixtures_dir is None:
            # Default to test/fixtures relative to this file
            fixtures_dir = Path(__file__).parent / 'fixtures'
        self.fixtures_dir = Path(fixtures_dir)

        if not self.fixtures_dir.exists():
            raise FileNotFoundError(
                f"Fixtures directory not found: {self.fixtures_dir}")

    def load_fixture(self, category: str, filename: str) -> Dict[str, Any]:
        """
        Load a specific fixture file

        Args:
            category: Subdirectory name (api, types, features, integration)
            filename: JSON filename (e.g., 'integer.json')

        Returns:
            Dictionary with 'description' and 'tests' keys
        """
        path = self.fixtures_dir / category / filename
        if not path.exists():
            raise FileNotFoundError(f"Fixture file not found: {path}")

        with open(path, 'r') as f:
            return json.load(f)

    def load_category(self, category: str) -> Dict[str, Dict[str, Any]]:
        """
        Load all fixture files in a category

        Args:
            category: Subdirectory name (api, types, features, integration)

        Returns:
            Dictionary mapping filename to fixture data
        """
        category_path = self.fixtures_dir / category
        if not category_path.exists():
            raise FileNotFoundError(f"Category directory not found: {category_path}")

        fixtures = {}
        for file_path in category_path.glob('*.json'):
            with open(file_path, 'r') as f:
                fixtures[file_path.name] = json.load(f)

        return fixtures

    def load_all_fixtures(self) -> Dict[str, Dict[str, Dict[str, Any]]]:
        """
        Load all fixture files organized by category

        Returns:
            Dictionary with structure: {category: {filename: fixture_data}}
        """
        all_fixtures = {}

        for category_path in self.fixtures_dir.iterdir():
            if category_path.is_dir() and not category_path.name.startswith('.'):
                category = category_path.name
                all_fixtures[category] = self.load_category(category)

        return all_fixtures

    def iter_tests(self, category: Optional[str] = None, filename: Optional[str] = None):
        """
        Iterator that yields individual test cases

        Args:
            category: Optional category to filter by
            filename: Optional filename to filter by

        Yields:
            Tuple of (category, filename, test_case)
        """
        if category and filename:
            # Load specific file
            fixture_data = self.load_fixture(category, filename)
            for test in fixture_data['tests']:
                yield (category, filename, test)
        elif category:
            # Load all files in category
            fixtures = self.load_category(category)
            for fname, fixture_data in fixtures.items():
                for test in fixture_data['tests']:
                    yield (category, fname, test)
        else:
            # Load all fixtures
            all_fixtures = self.load_all_fixtures()
            for cat, fixtures in all_fixtures.items():
                for fname, fixture_data in fixtures.items():
                    for test in fixture_data['tests']:
                        yield (cat, fname, test)


def get_test_cases(category: str, filename: str) -> List[Dict[str, Any]]:
    """
    Convenience function to get test cases from a fixture file

    Args:
        category: Category directory name
        filename: JSON filename

    Returns:
        List of test case dictionaries
    """
    loader = FixtureLoader()
    fixture = loader.load_fixture(category, filename)
    return fixture['tests']
