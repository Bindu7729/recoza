"""
Recoza Live Recommendation Pipeline Evaluation Script
Computes empirical metrics across real benchmark query workloads:
  - Category Accuracy (%)
  - Image Consistency (%)
  - Explanation Coverage (%)
  - Duplicate Rate (%)
  - Average Latency (ms)
"""
import os
import sys
import time
import json

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from engine.graph_engine import GraphEngine
from engine.ranking import RecommenderRanker
from engine.explainer import RecommendationExplainer
from engine.conversational_agent import ConversationalAgent
from engine.memory import UserMemory

def run_evaluation():
    data_dir = os.path.join(backend_dir, "data")
    engine = GraphEngine(data_dir)
    ranker = RecommenderRanker(engine)
    explainer = RecommendationExplainer(engine)
    agent = ConversationalAgent(engine, ranker, explainer)

    benchmark_queries = [
        {"query": "Recommend a lightweight laptop for programming under 70000", "expected_type": "laptop"},
        {"query": "Suggest a sci-fi movie like Interstellar", "expected_type": "movie"},
        {"query": "Recommend a useful gift for someone who loves photography", "expected_type": "photo"},
        {"query": "Recommend cooperative family board games", "expected_type": "game"},
        {"query": "STEM robotics and science kits for kids", "expected_type": "toy"},
        {"query": "LEGO architecture and building sets", "expected_type": "toy"},
        {"query": "Puzzles and family strategy board games", "expected_type": "game"},
        {"query": "Wireless noise cancelling headphones and keyboards", "expected_type": "audio_tech"}
    ]

    total_queries = len(benchmark_queries)
    category_matches = 0
    total_recs = 0
    duplicate_count = 0
    image_consistent_count = 0
    explanation_grounded_count = 0
    latencies = []

    print("=" * 70)
    print("RECOZA LIVE PIPELINE EVALUATION BENCHMARK")
    print("=" * 70)

    for idx, bq in enumerate(benchmark_queries, 1):
        mem = UserMemory(user_id=f"eval_user_{idx}")
        start_t = time.perf_counter()
        res = agent.process_message(bq["query"], mem, session_id=f"sess_{idx}")
        elapsed_ms = (time.perf_counter() - start_t) * 1000.0
        latencies.append(elapsed_ms)

        items = res.get("items", [])
        total_recs += len(items)

        # Check duplicates
        asins = [it['item_id'] for it in items]
        if len(asins) != len(set(asins)):
            duplicate_count += (len(asins) - len(set(asins)))

        # Category check
        exp_type = bq["expected_type"]
        query_pass = True
        
        if len(items) == 0:
            query_pass = False
        else:
            for it in items:
                # Check explanation
                if it.get("explanation") and it["explanation"].get("primary_reason"):
                    explanation_grounded_count += 1
                # Check image
                if it.get("image_url") and len(it["image_url"]) > 10:
                    image_consistent_count += 1

                # Domain check
                if exp_type == "laptop" and not it.get("is_laptop"):
                    query_pass = False
                elif exp_type == "movie" and not it.get("is_movie"):
                    query_pass = False
                elif exp_type == "photo" and not it.get("is_photo"):
                    query_pass = False
                elif exp_type == "audio_tech" and not it.get("is_audio_tech"):
                    query_pass = False
                elif exp_type == "game" and not it.get("is_game"):
                    query_pass = False
                elif exp_type == "toy" and not it.get("is_toy"):
                    query_pass = False

        if query_pass:
            category_matches += 1
            status_str = f"PASS ({len(items)} items)"
        else:
            status_str = f"FAIL (unexpected category / 0 items)"

        q_disp = bq['query'][:38] + "..." if len(bq['query']) > 38 else bq['query']
        print(f"[{idx}/{total_queries}] '{q_disp}' -> {status_str} | {elapsed_ms:.2f} ms")

    accuracy = (category_matches / total_queries) * 100.0
    dup_rate = (duplicate_count / max(1, total_recs)) * 100.0
    img_rate = (image_consistent_count / max(1, total_recs)) * 100.0
    exp_rate = (explanation_grounded_count / max(1, total_recs)) * 100.0
    mean_lat = sum(latencies) / len(latencies)

    print("=" * 70)
    print("EVALUATION RESULTS SUMMARY")
    print(f"Total Benchmark Workloads:      {total_queries}")
    print(f"Total Recommendations Produced: {total_recs}")
    print(f"Category Accuracy:              {accuracy:.1f}%")
    print(f"Duplicate Recommendation Rate:  {dup_rate:.1f}%")
    print(f"Image Consistency:              {img_rate:.1f}%")
    print(f"Explanation Grounded Coverage:  {exp_rate:.1f}%")
    print(f"Mean Pipeline Latency:          {mean_lat:.2f} ms")
    print("=" * 70)

if __name__ == '__main__':
    run_evaluation()
