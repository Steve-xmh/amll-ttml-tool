use wasm_bindgen::prelude::*;

use crate::{JSLyricLine, LyricLine, LyricWord};

use std::str::FromStr;

use nom::{bytes::complete::*, combinator::opt, multi::many1};
use nom::{character::complete::line_ending, IResult};

#[inline]
pub fn parse_time(src: &str) -> IResult<&str, usize> {
    let (src, _start) = tag("[")(src)?;

    let (src, min) = take_until1(":")(src)?;
    let (src, _) = tag(":")(src)?;
    let (src, sec) = take_until1(".")(src)?;
    let (src, _) = tag(".")(src)?;
    let (src, ms) = take_while_m_n(1, 3, |c: char| c.is_ascii_digit())(src)?;

    let min = u32::from_str(min).unwrap();
    let sec = u32::from_str(sec).unwrap();
    let mst = ms.trim_start_matches('0');
    let msl = mst.len();
    let ms = u32::from_str(ms).unwrap();

    let time = min as usize * 60 * 1000
        + sec as usize * 1000
        + ms as usize * (10usize).pow(3 - msl as u32);

    let (src, _) = tag("]")(src)?;
    Ok((src, time))
}

#[test]
fn time_test() {
    assert_eq!(parse_time("[00:01.12]"), Ok(("", 1120)));
    assert_eq!(parse_time("[00:10.254]"), Ok(("", 10254)));
    assert_eq!(parse_time("[01:10.1]"), Ok(("", 70100)));
    assert_eq!(parse_time("[168:10.254]"), Ok(("", 10090254)));
    assert!(parse_time("[168:10.254233]").is_err());
}

#[inline]
pub fn parse_line(src: &str) -> IResult<&str, Vec<LyricLine<'_>>> {
    let (src, times) = many1(parse_time)(src)?;
    match is_not("\r\n")(src) {
        Ok((src, line)) => {
            let (src, _) = opt(line_ending)(src)?;
            Ok((
                src,
                times
                    .into_iter()
                    .map(|t| LyricLine {
                        words: vec![LyricWord {
                            start_time: t,
                            end_time: 0,
                            word: line,
                        }],
                    })
                    .collect(),
            ))
        }
        Err(nom::Err::Error(nom::error::Error {
            input,
            code: nom::error::ErrorKind::IsNot,
        })) => Ok((
            src,
            times
                .into_iter()
                .map(|t| LyricLine {
                    words: vec![LyricWord {
                        start_time: t,
                        end_time: 0,
                        word: input,
                    }],
                })
                .collect(),
        )),
        Err(e) => Err(e),
    }
}

#[test]
fn lyric_line_test() {
    assert_eq!(
        parse_line("[00:01.12] test LyRiC"),
        Ok((
            "",
            vec![LyricLine {
                words: vec![LyricWord {
                    start_time: 1120,
                    end_time: 0,
                    word: " test LyRiC"
                }]
            }]
        ))
    );
    assert_eq!(
        parse_line("[00:10.254][00:10.254] sssxxx\nrestline"),
        Ok((
            "restline",
            vec![
                LyricLine {
                    words: vec![LyricWord {
                        start_time: 10254,
                        end_time: 0,
                        word: " sssxxx"
                    }]
                },
                LyricLine {
                    words: vec![LyricWord {
                        start_time: 10254,
                        end_time: 0,
                        word: " sssxxx"
                    }]
                }
            ]
        ))
    );
    assert_eq!(
        parse_line("[01:10.1]"),
        Ok((
            "",
            vec![LyricLine {
                words: vec![LyricWord {
                    start_time: 70100,
                    end_time: 0,
                    word: ""
                }]
            }]
        ))
    );
}

#[inline]
pub fn parse_lrc(src: &str) -> Vec<LyricLine> {
    let lines = src.lines();
    let mut result = Vec::with_capacity(lines.size_hint().1.unwrap_or(1024).min(1024));

    for line in lines {
        if let Ok((_, line)) = parse_line(line) {
            result.extend_from_slice(&line);
        }
    }
    result.sort_by(|a, b| {
        a.words
            .first()
            .unwrap()
            .start_time
            .cmp(&b.words.first().unwrap().start_time)
    });

    for i in (0..result.len()).rev() {
        if i == result.len() - 1 {
            result[i].words[0].end_time = result[i].words[0].start_time;
        } else {
            result[i].words[0].end_time = result[i + 1].words[0].start_time;
        }
    }

    result
}

#[wasm_bindgen(js_name = "parseLrc", skip_typescript)]
pub fn parse_lrc_js(src: &str) -> js_sys::Array {
    parse_lrc(src)
        .into_iter()
        .map(JSLyricLine::from)
        .map(JsValue::from)
        .collect()
}

#[test]
fn lrc_bench_test() {
    let mut times = Vec::with_capacity(1024);
    for _ in 0..1024 {
        let t = std::time::Instant::now();
        let _l = parse_lrc("[00:01.12] test LyRiC");
        times.push(t.elapsed());
    }
    let times = times.into_iter().map(|x| x.as_micros()).collect::<Vec<_>>();
    println!("used {} us", times.iter().sum::<u128>());
    println!(
        "average {} us",
        times.iter().sum::<u128>() / times.len() as u128
    );
}
