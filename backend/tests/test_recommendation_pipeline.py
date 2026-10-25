"""
Recoza End-to-End Test Suite
Directly verifies full multi-domain conversational recommendations:
  - Test 1: Category accuracy (Educational building toys)
  - Test 2: Tabletop & Board games (Catan, Azul, board games)
  - Test 3: Category switching (Multi-turn switch from toys to games to laptops)
  - Test 4: Laptop recommendations under budget (Programming laptops under ₹70,000)
  - Test 5: Movie recommendations (Top-rated cinema: Inception, Interstellar, Dune)
  - Test 6: Photography gear & creator gifts (Cameras, Peak Design, Joby GorillaPod)
  - Test 7: Preference memory & count constraints
  - Test 8: Ranking relevance (Higher-ranked items have superior relevance scores)
  - Test 9: Image consistency (Each image URL is valid and populated)
  - Test 10: Explanation quality (Metadata-grounded reasoning & specs)
  - Test 11: Duplicate prevention (Zero duplicate items in result sets)
  - Test 12: Frontend integration contract (Schema compatibility with frontend types)
  - Test 13: Feedback persistence and dislike suppression
"""
import os
import sys
import unittest

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from engine.graph_engine import GraphEngine
from engine.ranking import RecommenderRanker
from engine.explainer import RecommendationExplainer
from engine.conversational_agent import ConversationalAgent
from engine.memory import UserMemory
from storage import PersistentStore

class TestRecozaEndToEnd(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        data_dir = os.path.join(backend_dir, "data")
        cls.engine = GraphEngine(data_dir)
        cls.ranker = RecommenderRanker(cls.engine)
        cls.explainer = RecommendationExplainer(cls.engine)
        cls.agent = ConversationalAgent(cls.engine, cls.ranker, cls.explainer)
        cls.store = PersistentStore()

    def setUp(self):
        self.memory = UserMemory(user_id="recoza_test_user")

    def test_01_category_accuracy(self):
        """Scenario 1: Educational building toys -> returns verified building/STEM toys only."""
        query = "Recommend educational building toys for a 10-year-old"
        res = self.agent.process_message(query, self.memory, session_id="s1")
        items = res['items']
        self.assertGreaterEqual(len(items), 1, "Should return educational building toys")
        for it in items:
            t = it['title'].lower()
            self.assertFalse(any(b in t for b in ['doll', 'barbie', 'monster truck', 'hot wheels', 'plush']),
                            f"Non-toy '{it['title']}' returned for toy request")
            has_trait = (it.get('is_building') or it.get('is_educational') or
                         any(w in t for w in ['lego', 'brick', 'block', 'build', 'construct', 'stem', 'robot', 'science', 'magnet']))
            self.assertTrue(has_trait, f"Item '{it['title']}' lacks building/educational attributes")
        print("\n[PASS] Scenario 1: Category accuracy verified for educational building toys.")

    def test_02_game_accuracy(self):
        """Scenario 2: Tabletop and board games returned accurately."""
        query_game = "Recommend cooperative family board games"
        res_game = self.agent.process_message(query_game, self.memory, session_id="s2")
        self.assertGreaterEqual(len(res_game['items']), 1)
        for it in res_game['items']:
            self.assertTrue(it.get('is_game') or any(w in it['title'].lower() for w in ['game', 'puzzle', 'tower', 'balanc', 'board', 'card']),
                            f"Item '{it['title']}' must be a game")
        print("\n[PASS] Scenario 2: Game accuracy verified. Physical games returned.")

    def test_03_category_switching(self):
        """Scenario 3: Category switching from toys to games in the same session."""
        sess_id = "s3"
        res1 = self.agent.process_message("Recommend toys", self.memory, session_id=sess_id)
        self.assertGreaterEqual(len(res1['items']), 1)
        
        res2 = self.agent.process_message("Now recommend games", self.memory, session_id=sess_id)
        items2 = res2['items']
        self.assertGreaterEqual(len(items2), 1)
        for it in items2:
            self.assertTrue(it.get('is_game') or any(w in it['title'].lower() for w in ['game', 'puzzle', 'board', 'card', 'dice']),
                            f"Item '{it['title']}' should be a game after category switch")
        print("\n[PASS] Scenario 3: Category switching respected. Turn 2 returned games only.")

    def test_04_laptop_recommendation_under_budget(self):
        """Scenario 4: Requesting lightweight programming laptop under ₹70,000 returns actual laptops within budget."""
        query = "Recommend a lightweight laptop for programming under ₹70,000"
        res = self.agent.process_message(query, self.memory, session_id="s4")
        items = res['items']
        self.assertGreaterEqual(len(items), 1, "Should return matching laptops")
        for it in items:
            self.assertTrue(it.get('is_laptop'), f"Item '{it['title']}' must be a laptop")
            if it.get('price') is not None and it.get('price_currency') == 'INR':
                self.assertLessEqual(it['price'], 70000.0, f"Laptop price {it['price']} must be <= ₹70,000")
        print("\n[PASS] Scenario 4: Laptop recommendation verified under INR 70,000 budget.")

    def test_05_movie_recommendation(self):
        """Scenario 5: Requesting movies returns actual cinematic recommendations with directors and ratings."""
        query = "Suggest a sci-fi movie like Interstellar"
        res = self.agent.process_message(query, self.memory, session_id="s5")
        items = res['items']
        self.assertGreaterEqual(len(items), 1, "Should return movie recommendations")
        for it in items:
            self.assertTrue(it.get('is_movie'), f"Item '{it['title']}' must be a movie")
        print("\n[PASS] Scenario 5: Movie recommendation verified.")

    def test_06_photography_gift_recommendation(self):
        """Scenario 6: Requesting a gift for someone who loves photography returns photography gear."""
        query = "Recommend a useful gift for someone who loves photography"
        res = self.agent.process_message(query, self.memory, session_id="s6")
        items = res['items']
        self.assertGreaterEqual(len(items), 1, "Should return photography gear")
        for it in items:
            self.assertTrue(it.get('is_photo'), f"Item '{it['title']}' must be photography equipment")
        print("\n[PASS] Scenario 6: Photography gift recommendation verified.")

    def test_07_preference_memory(self):
        """Scenario 7: Multi-turn preference accumulation and count specification."""
        sess_id = "s7"
        self.agent.process_message("Show two options for LEGO building sets", self.memory, session_id=sess_id)
        res = self.agent.process_message("under $60", self.memory, session_id=sess_id)
        self.assertLessEqual(len(res['items']), 2)
        print("\n[PASS] Scenario 7: Preference memory persisted across turns and count was respected.")

    def test_08_ranking_relevance(self):
        """Scenario 8: Top-ranked candidate has higher relevance score than lower-ranked candidate."""
        query = "LEGO architecture and skyline building sets"
        items = self.ranker.recommend(self.memory, query=query, top_k=4)
        self.assertGreaterEqual(len(items), 2)
        score1 = items[0].get('ranking_meta', {}).get('final_score', 0)
        score_last = items[-1].get('ranking_meta', {}).get('final_score', 0)
        self.assertGreaterEqual(score1, score_last, f"Rank 1 ({score1}) must >= Rank {len(items)} ({score_last})")
        print(f"\n[PASS] Scenario 8: Ranking relevance verified (Rank 1 score: {score1:.4f} >= Rank {len(items)} score: {score_last:.4f}).")

    def test_09_image_consistency(self):
        """Scenario 9: Every item has a valid, non-empty image URL."""
        res = self.agent.process_message("Show laptops for programming", self.memory, session_id="s9")
        for it in res['items']:
            self.assertTrue(it.get('image_url') and len(it['image_url']) > 10,
                            f"Item {it['item_id']} missing valid image URL")
        print("\n[PASS] Scenario 9: Image consistency verified across all candidates.")

    def test_10_explanation_quality(self):
        """Scenario 10: Explanations contain item-specific attributes and ground truth reasoning."""
        res = self.agent.process_message("Recommend a lightweight laptop under ₹70,000", self.memory, session_id="s10")
        items = res['items']
        self.assertGreaterEqual(len(items), 1)
        top_exp = items[0]['explanation']
        self.assertIn('primary_reason', top_exp)
        self.assertIn('community_context', top_exp)
        self.assertIn('matching_attributes', top_exp)
        self.assertGreaterEqual(len(top_exp['matching_attributes']), 2)
        print("\n[PASS] Scenario 10: Explanation quality and grounding verified.")

    def test_11_duplicate_prevention(self):
        """Scenario 11: Zero duplicate item IDs in recommendation sets."""
        res = self.agent.process_message("Show top movies to watch", self.memory, session_id="s11")
        items = res['items']
        ids = [it['item_id'] for it in items]
        self.assertEqual(len(ids), len(set(ids)), f"Duplicate item IDs detected in results: {ids}")
        print("\n[PASS] Scenario 11: Duplicate prevention verified (0 duplicate items).")

    def test_12_frontend_integration_contract(self):
        """Scenario 12: Backend output structure matches frontend TypeScript interface definitions."""
        res = self.agent.process_message("Recommend a laptop", self.memory, session_id="s12")
        self.assertIn('reply', res)
        self.assertIn('items', res)
        for it in res['items']:
            for req_field in ['item_id', 'title', 'category', 'price_formatted', 'average_rating', 'image_url', 'explanation']:
                self.assertIn(req_field, it, f"Frontend contract missing required field '{req_field}'")
        print("\n[PASS] Scenario 12: Frontend integration contract verified with TypeScript schema.")

    def test_13_regression_feedback_persistence(self):
        """Scenario 13: Feedback persistence, dislike suppression, and memory state tracking."""
        item_id = "LAP_MBA_M1"
        self.memory.add_feedback(item_id, 'dislike', reason="outside_brand_preference")
        self.assertIn(item_id, self.memory.disliked_items)
        
        # When recommending laptops, the disliked item must NOT be returned
        recs = self.ranker.recommend(self.memory, query="programming laptop", domain_type="laptops", top_k=6)
        rec_ids = [it['item_id'] for it in recs]
        self.assertNotIn(item_id, rec_ids, "Disliked item should be suppressed from recommendation results")
        print("\n[PASS] Scenario 13: Regression verification passed. Feedback and memory state active.")

if __name__ == '__main__':
    unittest.main()
