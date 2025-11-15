'''
Test runner that uses JSON fixtures
This ensures test parity between Python and JavaScript implementations
'''

import unittest
from jsonschema.exceptions import SchemaError

from jsonsubschema import isSubschema, meetSchemas, joinSchemas, isEquivalent
from test.fixture_loader import FixtureLoader


class TestFromFixtures(unittest.TestCase):
    """Run tests from JSON fixtures"""

    @classmethod
    def setUpClass(cls):
        cls.loader = FixtureLoader()

    def run_test_case(self, test_case, category, filename):
        """
        Run a single test case from a fixture

        Args:
            test_case: Dictionary containing test data
            category: Category name (for better error messages)
            filename: Filename (for better error messages)
        """
        test_name = test_case['name']
        schema1 = test_case['schema1']
        schema2 = test_case['schema2']

        # Check if this test should raise an error
        if test_case.get('shouldError', False):
            error_type = test_case.get('errorType', 'Exception')
            with self.subTest(test=test_name, check='shouldError'):
                if error_type == 'SchemaError':
                    with self.assertRaises(SchemaError):
                        isSubschema(schema1, schema2)
                else:
                    with self.assertRaises(Exception):
                        isSubschema(schema1, schema2)
            return

        # Check if test should be skipped
        if test_case.get('skip', False):
            skip_reason = test_case.get('skipReason', 'Skipped in fixture')
            self.skipTest(skip_reason)
            return

        operations = test_case.get('operations', {})

        # Test isSubschema operation
        if 'isSubschema' in operations:
            expected = operations['isSubschema']

            with self.subTest(test=test_name, check='s1_sub_s2'):
                result = isSubschema(schema1, schema2)
                # Note: isSubschema may return None to indicate "not a subschema"
                # Treat None as False for comparison
                if expected['s1_sub_s2']:
                    self.assertTrue(
                        result,
                        f"isSubschema(s1, s2) failed in {category}/{filename}:{test_name}\n"
                        f"s1: {schema1}\n"
                        f"s2: {schema2}\n"
                        f"Expected: {expected['s1_sub_s2']}, Got: {result}"
                    )
                else:
                    self.assertFalse(
                        result,
                        f"isSubschema(s1, s2) failed in {category}/{filename}:{test_name}\n"
                        f"s1: {schema1}\n"
                        f"s2: {schema2}\n"
                        f"Expected: {expected['s1_sub_s2']}, Got: {result}"
                    )

            with self.subTest(test=test_name, check='s2_sub_s1'):
                result = isSubschema(schema2, schema1)
                # Note: isSubschema may return None to indicate "not a subschema"
                # Treat None as False for comparison
                if expected['s2_sub_s1']:
                    self.assertTrue(
                        result,
                        f"isSubschema(s2, s1) failed in {category}/{filename}:{test_name}\n"
                        f"s1: {schema1}\n"
                        f"s2: {schema2}\n"
                        f"Expected: {expected['s2_sub_s1']}, Got: {result}"
                    )
                else:
                    self.assertFalse(
                        result,
                        f"isSubschema(s2, s1) failed in {category}/{filename}:{test_name}\n"
                        f"s1: {schema1}\n"
                        f"s2: {schema2}\n"
                        f"Expected: {expected['s2_sub_s1']}, Got: {result}"
                    )

        # Test isEquivalent operation
        if 'isEquivalent' in operations:
            expected = operations['isEquivalent']
            with self.subTest(test=test_name, check='isEquivalent'):
                result = isEquivalent(schema1, schema2)
                self.assertEqual(
                    result,
                    expected,
                    f"isEquivalent failed in {category}/{filename}:{test_name}\n"
                    f"s1: {schema1}\n"
                    f"s2: {schema2}\n"
                    f"Expected: {expected}, Got: {result}"
                )

        # Test meet operation
        if 'meet' in operations:
            expected = operations['meet']
            with self.subTest(test=test_name, check='meet'):
                result = meetSchemas(schema1, schema2)
                # For meet, we check if result is equivalent to expected
                self.assertTrue(
                    isEquivalent(result, expected),
                    f"meetSchemas failed in {category}/{filename}:{test_name}\n"
                    f"s1: {schema1}\n"
                    f"s2: {schema2}\n"
                    f"Expected: {expected}\n"
                    f"Got: {result}"
                )

        # Test join operation
        if 'join' in operations:
            expected = operations['join']
            with self.subTest(test=test_name, check='join'):
                result = joinSchemas(schema1, schema2)
                # For join, we check if result is equivalent to expected
                self.assertTrue(
                    isEquivalent(result, expected),
                    f"joinSchemas failed in {category}/{filename}:{test_name}\n"
                    f"s1: {schema1}\n"
                    f"s2: {schema2}\n"
                    f"Expected: {expected}\n"
                    f"Got: {result}"
                )


# Dynamically generate test methods for each fixture file
def _create_test_method(category, filename):
    """Create a test method for a specific fixture file"""

    def test_method(self):
        fixture_data = self.loader.load_fixture(category, filename)
        for test_case in fixture_data['tests']:
            self.run_test_case(test_case, category, filename)

    # Set a nice name for the test method
    test_name = f"test_{category}_{filename.replace('.json', '')}"
    test_method.__name__ = test_name
    return test_method


# Auto-discover and add test methods
loader = FixtureLoader()
for category, fixtures in loader.load_all_fixtures().items():
    for filename in fixtures.keys():
        test_method = _create_test_method(category, filename)
        setattr(TestFromFixtures, test_method.__name__, test_method)


if __name__ == '__main__':
    unittest.main()
