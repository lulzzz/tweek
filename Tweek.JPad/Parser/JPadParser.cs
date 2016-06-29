﻿using System;
using System.CodeDom.Compiler;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Engine.Core.Context;
using Engine.Core.Rules;
using Engine.DataTypes;
using Engine.Match.DSL;
using Engine.Rules;
using Engine.Rules.Creation;
using Engine.Rules.ValueDistribution;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Tweek.JPad.Rules;

namespace Tweek.JPad
{
    public delegate ConfigurationValue ValueDistributor(params object[] units);
    public delegate bool Matcher(GetContextValue fullContext);

    public class JPadParser : IRuleParser
    {
        private readonly Dictionary<string, MatchDSL.ComparerDelegate> _comparers;
        public JPadParser(Dictionary<string, MatchDSL.ComparerDelegate>  comparers = null )
        {
            _comparers = comparers ?? new Dictionary<string, MatchDSL.ComparerDelegate>();
        }
        ValueDistributor ParseValueDistrubtor(JToken schema)
        {
            var valueDistributor = ValueDistribution.compile_ext(schema.ToString());
            return units => new ConfigurationValue(valueDistributor(units));
        }

        Matcher ParseMatcher(JToken schema)
        {
            var matcher = MatchDSL.Compile_Ext(schema.ToString(),
                new MatchDSL.ParserSettings( comparers: _comparers));

            return (context) => matcher(key => context(key).IfNoneUnsafe((string) null));
        }

        private IRule ParseRule(RuleData data)
        {
            var matcher = ParseMatcher(data.Matcher);

            if (data.Type == "SingleVariant")
            {
                return new SingleVariantRule
                {
                    Matcher = matcher,
                    Value = new ConfigurationValue(data.Value)
                };
            }
            if (data.Type == "MultiVariant")
            {

                var valueDistributors =
                    (data.ValueDistribution["type"] != null)
                        ? new SortedList<DateTimeOffset, ValueDistributor>(new Dictionary
                            <DateTimeOffset, ValueDistributor>
                        {
                            [new DateTime(1970, 1, 1, 0, 0, 0, 0)] = ParseValueDistrubtor(data.ValueDistribution)
                        })
                        : new SortedList<DateTimeOffset, ValueDistributor>(
                            data.ValueDistribution.ToObject<JObject>()
                                .Properties()
                                .ToDictionary(x => DateTimeOffset.Parse(x.Name), x => ParseValueDistrubtor(x.Value))
                            );

                return new MultiVariantRule
                {
                    OwnerType = data.OwnerType,
                    ExperimentId = data.Id,
                    Matcher = matcher,
                    ValueDistributors = valueDistributors
                };
            }
            throw new Exception("no parser for rule type");
        }

 
        public IRule Parse(string text)
        {
            var rules = JsonConvert.DeserializeObject<List<RuleData>>(text);
            return new RuleSet(rules.Select(ParseRule).ToArray());

        }
    }
}